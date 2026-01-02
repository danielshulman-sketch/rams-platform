import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
    private openai: OpenAI;

    constructor(private prisma: PrismaService) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || '',
        });
    }

    private getOpenAiErrorMessage(error: any): string {
        const status = error?.status ?? error?.response?.status;
        const apiMessage = error?.error?.message ?? error?.response?.data?.error?.message ?? error?.message;

        if (status === 401 || status === 403) {
            return 'OpenAI authentication failed. Check OPENAI_API_KEY.';
        }
        if (status === 429) {
            return 'OpenAI rate limit or quota exceeded. Try again later or check billing.';
        }
        if (status === 400) {
            return `OpenAI request invalid${apiMessage ? `: ${apiMessage}` : ''}`;
        }
        return `OpenAI request failed${apiMessage ? `: ${apiMessage}` : ''}`;
    }

    async generateRamsFromScope(
        scopeText: string,
        organizationId: string,
        jobDetails?: any,
    ): Promise<any> {
        if (!process.env.OPENAI_API_KEY) {
            throw new BadRequestException('OPENAI_API_KEY is not configured on the server.');
        }

        // Get relevant knowledge base items
        const knowledgeItems = await (this.prisma as any).knowledgeBaseItem.findMany({
            where: {
                organizationId,
                isActive: true,
            },
            take: 10, // Limit context size
        });

        // Build context from knowledge base
        const knowledgeContext = knowledgeItems
            .map(item => `[${item.category}] ${item.title}:\n${item.content}`)
            .join('\n\n---\n\n');

        const prompt = `You are a specialized Health & Safety Consultant for the construction industry, tasked with writing a professional, site-specific Risk Assessment and Method Statement (RAMS) document.

CONTEXT:
SCOPE OF WORK:
${scopeText}

${jobDetails ? `PROJECT DETAILS:
Project Name: ${jobDetails.projectName || 'N/A'}
Client: ${jobDetails.clientName || 'N/A'}
Site Address: ${jobDetails.siteAddress || 'N/A'}
` : ''}

RELEVANT KNOWLEDGE BASE (Your primary source for safety standards):
${knowledgeContext || 'Standard UK Construction Safety Guidelines apply.'}

INSTRUCTIONS:
Generate a HIGH-QUALITY, DETAILED document. Do not be generic. Use the scope and site details to make it specific.
Demand specific, real-world content. For example, if the scope mentions "roof work", ensure hazards like "falls from height" and controls like "edge protection" are present. If "excavation" is mentioned, include "trench collapse" and "shoring".

1. **Method Statement**: This must be a detailed, step-by-step logic flow of how the work will be performed. Break it down into phases (e.g., Arrival, Setup, Execution, Clear-up). Each step should be actionable and specific to the scope.
2. **Hazards**: Identify specific, relevant hazards related to this scope. Avoid generic filler. For example, if "roof" is mentioned, include "Falls from height". If "electrical work" is mentioned, include "Electric shock".
3. **Controls**: Use the Knowledge Base to define strict, practical control measures. These must directly mitigate the identified hazards.
4. **Emergency**: Provide realistic and specific emergency procedures relevant to the potential incidents on this site/job.

OUTPUT FORMAT (JSON):
{
  "activityDescription": "Professional summary of the works (2-3 sentences)",
  "location": "Specific location from details or scope",
  "assessmentDate": "${new Date().toISOString()}",
  "personnel": [
    {"name": "Site Supervisor", "role": "Supervision & H&S Compliance", "qualifications": "SSSTS/SMSTS"},
    {"name": "Operative", "role": "General Task Execution", "qualifications": "CSCS, Asbestos Awareness"}
  ],
  "hazards": [
    {
      "description": "Specific hazard description (e.g., 'Failure of lifting accessories during steel beam installation')",
      "riskLevel": "High",
      "affectedPersons": "Operatives, Public",
      "consequences": "Severe injury, fatality"
    }
  ],
  "controlMeasures": [
    {
      "description": "Detailed control measure (e.g., 'All lifting accessories to be certified and visually inspected before use. Exclusion zone to be established.')",
      "responsibility": "Site Supervisor",
      "timing": "Before work commences"
    }
  ],
  "ppe": ["Hard Hat", "High-Vis Vest", "Safety Boots", "Gloves", "Safety Glasses"],
  "methodStatement": [
    "1. **Arrival & Induction**: Team to arrive at ${jobDetails?.siteAddress || 'site'}, sign in, and receive site induction.",
    "2. **Setup**: Establish exclusion zone using barriers and signage.",
    "3. **Execution**: [Insert specific steps based on scope...]",
    "4. **Completion**: Remove all waste and equipment, leave area clean."
  ],
  "emergencyInfo": {
    "hospital": "Nearest A&E (To be confirmed on site)",
    "emergencyContact": "Site Manager"
  },
  "residualRisk": "Low"
}

Ensure the content is professional, legally compliant (HSE UK standards), and fully addresses the scope provided. You MUST return a VALID JSON object. Do not wrap in markdown code blocks.`;

        const messages: any[] = [
            {
                role: 'system',
                content: 'You are a UK health and safety expert specializing in construction RAMS documents. Provide detailed, practical, and legally compliant safety guidance. You MUST return raw JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ];

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: messages,
                temperature: 0.7,
                response_format: { type: 'json_object' },
            });

            const generatedContent = response.choices[0].message.content;
            return JSON.parse(generatedContent || '{}');
        } catch (error: any) {
            // Check for specific OpenAI error regarding response_format
            if (error?.status === 400 && error?.error?.message?.includes('response_format')) {
                console.warn('OpenAI: JSON mode not supported for this model/configuration. Retrying without response_format...');
                try {
                    const response = await this.openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: messages,
                        temperature: 0.7,
                        // Retry without response_format
                    });

                    let generatedContent = response.choices[0].message.content || '{}';
                    // Strip markdown code blocks if present
                    generatedContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
                    return JSON.parse(generatedContent);
                } catch (retryError) {
                    console.error('AI generation fallback error:', retryError);
                    throw new Error(`Failed to generate RAMS with AI (Fallback): ${retryError.message}`);
                }
            }

            console.error('AI generation error:', error);
            throw new Error(`Failed to generate RAMS with AI: ${error.message}`);
        }
    }

    async extractScopeData(text: string): Promise<any> {
        const prompt = `Extract key information from this scope of work document for a RAMS assessment.

DOCUMENT TEXT:
${text}

Return a JSON object with:
{
  "workDescription": "What work is being done",
  "location": "Where the work is happening",
  "equipment": ["List of equipment/tools mentioned"],
  "materials": ["Materials being used"],
  "identifiedHazards": ["Potential hazards mentioned or implied"],
  "duration": "Expected duration of work",
  "accessRequirements": "Any special access needed"
}

You MUST return a VALID JSON object. Do not wrap in markdown code blocks.`;

        const messages: any[] = [{ role: 'user', content: prompt }];

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: messages,
                temperature: 0.5,
                response_format: { type: 'json_object' },
            });

            return JSON.parse(response.choices[0].message.content || '{}');
        } catch (error: any) {
            // Check for specific OpenAI error regarding response_format
            if (error?.status === 400 && error?.error?.message?.includes('response_format')) {
                console.warn('OpenAI: JSON mode not supported for this model/configuration. Retrying without response_format...');
                try {
                    const response = await this.openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: messages,
                        temperature: 0.5,
                        // Retry without response_format
                    });

                    let generatedContent = response.choices[0].message.content || '{}';
                    // Strip markdown code blocks if present
                    generatedContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
                    return JSON.parse(generatedContent);
                } catch (retryError) {
                    console.error('Scope extraction fallback error:', retryError);
                    // Return empty structure on failure for this method as it's less critical/handled gracefully upstream
                    return {
                        workDescription: 'Unable to extract (AI Error)',
                        location: '',
                        equipment: [],
                        materials: [],
                        identifiedHazards: [],
                        duration: '',
                        accessRequirements: '',
                    };
                }
            }

            console.error('Scope extraction error:', error);
            return {
                workDescription: 'Unable to extract',
                location: '',
                equipment: [],
                materials: [],
                identifiedHazards: [],
                duration: '',
                accessRequirements: '',
            };
        }
    }
}
