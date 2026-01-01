import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

export interface ExtractedJobData {
    projectName: string | null;
    clientName: string | null;
    mainContractor: string | null;
    siteAddress: string | null;
    sitePostcode: string | null;
    startDate: string | null;
    endDate: string | null;
    scopeOfWorks: string | null;
    referenceNumber: string | null;
    confidence: number;
}

@Injectable()
export class UploadService {
    constructor(private aiService: AiService) { }

    async extractJobFromPDF(buffer: Buffer): Promise<ExtractedJobData> {
        // pdf-parse v1.1.1 is a simple CommonJS module
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        const text = data.text;

        // Use regex patterns to extract structured data
        const extracted = this.extractWithRegex(text);

        return extracted;
    }

    async extractRamsDataFromScope(buffer: Buffer, organizationId: string): Promise<any> {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        const text = data.text;

        // Use AI to extract structured RAMS data
        return await this.aiService.extractScopeData(text);
    }

    async generateRamsWithAI(scopeText: string, organizationId: string, jobDetails?: any): Promise<any> {
        return await this.aiService.generateRamsFromScope(scopeText, organizationId, jobDetails);
    }

    private extractWithRegex(text: string): ExtractedJobData {
        const lines = text.split('\n').map(l => l.trim());
        const fullText = text.toLowerCase();

        // Extract project name - look for common patterns
        const projectName = this.extractProjectName(lines, fullText);

        // Extract client name
        const clientName = this.extractClientName(lines, fullText);

        // Extract main contractor
        const mainContractor = this.extractContractor(lines, fullText);

        // Extract address
        const siteAddress = this.extractAddress(lines);

        // Extract postcode (UK format)
        const sitePostcode = this.extractPostcode(text);

        // Extract dates
        const { startDate, endDate } = this.extractDates(text);

        // Extract reference number
        const referenceNumber = this.extractReferenceNumber(lines, fullText);

        // Scope of works is the full text (cleaned up)
        const scopeOfWorks = text.trim();

        // Calculate confidence based on how many fields we found
        const fieldsFound = [projectName, clientName, siteAddress, sitePostcode, scopeOfWorks].filter(Boolean).length;
        const confidence = fieldsFound / 5;

        return {
            projectName,
            clientName,
            mainContractor,
            siteAddress,
            sitePostcode,
            startDate,
            endDate,
            scopeOfWorks,
            referenceNumber,
            confidence,
        };
    }

    private extractProjectName(lines: string[], fullText: string): string | null {
        // Look for patterns like "Project:", "Job:", "Project Name:"
        const patterns = [
            /project\s*name\s*[:\-]\s*(.+)/i,
            /project\s*[:\-]\s*(.+)/i,
            /job\s*name\s*[:\-]\s*(.+)/i,
            /job\s*[:\-]\s*(.+)/i,
            /works\s*description\s*[:\-]\s*(.+)/i,
        ];

        for (const pattern of patterns) {
            const match = fullText.match(pattern);
            if (match && match[1]?.trim()) {
                return match[1].trim().split('\n')[0].substring(0, 200);
            }
        }

        // Fallback: look for first substantial line
        for (const line of lines) {
            if (line.length > 10 && !line.match(/^(page|date|ref)/i)) {
                return line.substring(0, 200);
            }
        }

        return null;
    }

    private extractClientName(lines: string[], fullText: string): string | null {
        const patterns = [
            /client\s*name\s*[:\-]\s*(.+)/i,
            /client\s*[:\-]\s*(.+)/i,
            /for\s*[:\-]\s*(.+?)\s*(ltd|limited|plc|construction)/i,
            /customer\s*[:\-]\s*(.+)/i,
        ];

        for (const pattern of patterns) {
            const match = fullText.match(pattern);
            if (match && match[1]?.trim()) {
                return match[1].trim().split('\n')[0].substring(0, 200);
            }
        }

        // Look for company names (Ltd, Limited, PLC, etc.)
        const companyMatch = fullText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Ltd|Limited|PLC|Construction|Builders))/);
        if (companyMatch) {
            return companyMatch[1];
        }

        return null;
    }

    private extractContractor(lines: string[], fullText: string): string | null {
        const patterns = [
            /main\s*contractor\s*[:\-]\s*(.+)/i,
            /contractor\s*[:\-]\s*(.+)/i,
            /principal\s*contractor\s*[:\-]\s*(.+)/i,
        ];

        for (const pattern of patterns) {
            const match = fullText.match(pattern);
            if (match && match[1]?.trim()) {
                return match[1].trim().split('\n')[0].substring(0, 200);
            }
        }

        return null;
    }

    private extractAddress(lines: string[]): string | null {
        // Look for address patterns
        const addressPatterns = [
            /(?:site\s*)?address\s*[:\-]\s*(.+)/i,
            /location\s*[:\-]\s*(.+)/i,
            /site\s*[:\-]\s*(.+)/i,
        ];

        for (const line of lines) {
            for (const pattern of addressPatterns) {
                const match = line.match(pattern);
                if (match && match[1]?.trim()) {
                    // Get this line and possibly next line
                    const idx = lines.indexOf(line);
                    let address = match[1].trim();
                    if (idx + 1 < lines.length && !lines[idx + 1].match(/:/)) {
                        address += ', ' + lines[idx + 1];
                    }
                    return address.substring(0, 300);
                }
            }
        }

        return null;
    }

    private extractPostcode(text: string): string | null {
        // UK postcode regex
        const postcodeRegex = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/g;
        const matches = text.match(postcodeRegex);

        if (matches && matches.length > 0) {
            // Return the first match, properly formatted
            return matches[0].replace(/\s+/g, ' ').toUpperCase();
        }

        return null;
    }

    private extractDates(text: string): { startDate: string | null; endDate: string | null } {
        const datePatterns = [
            /start\s*date\s*[:\-]\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
            /end\s*date\s*[:\-]\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
            /completion\s*date\s*[:\-]\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
        ];

        let startDate: string | null = null;
        let endDate: string | null = null;

        const startMatch = text.match(datePatterns[0]);
        if (startMatch) {
            startDate = this.parseDate(startMatch[1]);
        }

        const endMatch = text.match(datePatterns[1]) || text.match(datePatterns[2]);
        if (endMatch) {
            endDate = this.parseDate(endMatch[1]);
        }

        return { startDate, endDate };
    }

    private parseDate(dateStr: string): string | null {
        // Try to parse various date formats and return YYYY-MM-DD
        try {
            const parts = dateStr.split(/[-\/]/);
            if (parts.length === 3) {
                let day, month, year;

                // Determine format (DD/MM/YYYY or MM/DD/YYYY)
                if (parts[2].length === 4) {
                    // DD/MM/YYYY or MM/DD/YYYY
                    day = parts[0];
                    month = parts[1];
                    year = parts[2];
                } else {
                    // MM/DD/YY or DD/MM/YY
                    day = parts[0];
                    month = parts[1];
                    year = '20' + parts[2];
                }

                // Validate and format
                const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                if (!isNaN(d.getTime())) {
                    return d.toISOString().split('T')[0];
                }
            }
        } catch (e) {
            // Invalid date
        }

        return null;
    }

    private extractReferenceNumber(lines: string[], fullText: string): string | null {
        const patterns = [
            /ref(?:erence)?\s*(?:no|number)?\s*[:\-]\s*([A-Z0-9\-]+)/i,
            /job\s*(?:no|number)\s*[:\-]\s*([A-Z0-9\-]+)/i,
            /quote\s*(?:no|number)?\s*[:\-]\s*([A-Z0-9\-]+)/i,
        ];

        for (const pattern of patterns) {
            const match = fullText.match(pattern);
            if (match && match[1]?.trim()) {
                return match[1].trim();
            }
        }

        return null;
    }
}
