import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export class ExportService {
    private normalizeRamsData(rams: any) {
        const assessmentDate = rams.assessmentDate
            ? new Date(rams.assessmentDate)
            : rams.createdAt
                ? new Date(rams.createdAt)
                : new Date();

        const activityDescription =
            rams.activityDescription ||
            rams.title ||
            rams.projectDetails?.projectName ||
            rams.projectName ||
            'N/A';

        const location =
            rams.location ||
            rams.projectDetails?.siteAddress ||
            rams.siteAddress ||
            'N/A';

        const hazards = (rams.hazards || []).map((hazard: any) => {
            if (hazard.riskAssessment) {
                const rating = hazard.riskAssessment.rating || hazard.riskAssessment.likelihood * hazard.riskAssessment.severity;
                let riskLevel = 'Medium';
                if (rating <= 4) riskLevel = 'Low';
                else if (rating >= 13) riskLevel = 'High';
                return {
                    description: hazard.description,
                    riskLevel,
                    controls: hazard.controls || [],
                };
            }
            return {
                description: hazard.description,
                riskLevel: hazard.riskLevel || 'Medium',
                controls: hazard.controls || [],
            };
        });

        const controlMeasures = rams.controlMeasures || hazards.flatMap((hazard: any) =>
            (hazard.controls || []).map((control: string) => ({ description: control }))
        );

        const emergencyInfo = rams.emergencyInfo || rams.emergency || {};

        return {
            ...rams,
            activityDescription,
            location,
            assessmentDate,
            hazards,
            controlMeasures,
            emergencyInfo,
            scopeOfWorks: rams.scopeOfWorks || rams.scope || '',
            methodStatement: rams.methodStatement || '',
        };
    }

    async generatePDF(rams: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const normalized = this.normalizeRamsData(rams);
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Title
            doc.fontSize(20).text('Risk Assessment & Method Statement', { align: 'center' });
            doc.moveDown();

            // Job Details
            doc.fontSize(14).text('Job Details', { underline: true });
            doc.fontSize(10);
            doc.text(`Job Number: ${normalized.jobNumber || 'N/A'}`);
            doc.text(`Activity: ${normalized.activityDescription || 'N/A'}`);
            doc.text(`Location: ${normalized.location || 'N/A'}`);
            doc.text(`Date: ${new Date(normalized.assessmentDate).toLocaleDateString()}`);
            doc.moveDown();

            if (normalized.scopeOfWorks) {
                doc.fontSize(14).text('Scope of Works', { underline: true });
                doc.fontSize(10);
                doc.text(normalized.scopeOfWorks);
                doc.moveDown();
            }

            // Personnel
            if (normalized.personnel?.length > 0) {
                doc.fontSize(14).text('Personnel', { underline: true });
                doc.fontSize(10);
                normalized.personnel.forEach((person: any) => {
                    doc.text(`- ${person.name} (${person.role})`);
                });
                doc.moveDown();
            }

            // Hazards
            if (normalized.hazards?.length > 0) {
                doc.fontSize(14).text('Hazards Identified', { underline: true });
                doc.fontSize(10);
                normalized.hazards.forEach((hazard: any, index: number) => {
                    doc.text(`${index + 1}. ${hazard.description}`);
                    doc.text(`   Risk Level: ${hazard.riskLevel}`, { indent: 20 });
                });
                doc.moveDown();
            }

            // Control Measures
            if (normalized.controlMeasures?.length > 0) {
                doc.fontSize(14).text('Control Measures', { underline: true });
                doc.fontSize(10);
                normalized.controlMeasures.forEach((measure: any, index: number) => {
                    doc.text(`${index + 1}. ${measure.description}`);
                });
                doc.moveDown();
            }

            if (normalized.methodStatement) {
                doc.fontSize(14).text('Method Statement', { underline: true });
                doc.fontSize(10);
                doc.text(normalized.methodStatement);
                doc.moveDown();
            }

            // PPE
            if (normalized.ppe?.length > 0) {
                doc.fontSize(14).text('Required PPE', { underline: true });
                doc.fontSize(10);
                normalized.ppe.forEach((item: string) => {
                    doc.text(`- ${item}`);
                });
                doc.moveDown();
            }

            // Emergency Info
            if (normalized.emergencyInfo) {
                doc.fontSize(14).text('Emergency Arrangements', { underline: true });
                doc.fontSize(10);
                if (normalized.emergencyInfo.hospital) {
                    doc.text(`Nearest Hospital: ${normalized.emergencyInfo.hospital}`);
                    doc.text(`Address: ${normalized.emergencyInfo.hospitalAddress || 'N/A'}`);
                    doc.text(`Phone: ${normalized.emergencyInfo.hospitalPhone || 'N/A'}`);
                }
                if (normalized.emergencyInfo.emergencyContact) {
                    doc.text(`Emergency Contact: ${normalized.emergencyInfo.emergencyContact}`);
                }
            }

            doc.end();
        });
    }

    async generateWord(rams: any): Promise<Buffer> {
        const normalized = this.normalizeRamsData(rams);
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: 'Risk Assessment & Method Statement',
                        heading: HeadingLevel.HEADING_1,
                        alignment: 'center',
                    }),
                    new Paragraph({ text: '' }),

                    new Paragraph({
                        text: 'Job Details',
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Job Number: ', bold: true }),
                            new TextRun(normalized.jobNumber || 'N/A'),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Activity: ', bold: true }),
                            new TextRun(normalized.activityDescription || 'N/A'),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Location: ', bold: true }),
                            new TextRun(normalized.location || 'N/A'),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Date: ', bold: true }),
                            new TextRun(new Date(normalized.assessmentDate).toLocaleDateString()),
                        ],
                    }),
                    new Paragraph({ text: '' }),

                    ...(normalized.scopeOfWorks ? [
                        new Paragraph({
                            text: 'Scope of Works',
                            heading: HeadingLevel.HEADING_2,
                        }),
                        new Paragraph({ text: normalized.scopeOfWorks }),
                        new Paragraph({ text: '' }),
                    ] : []),

                    new Paragraph({
                        text: 'Hazards Identified',
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...(normalized.hazards || []).map((hazard: any, index: number) =>
                        new Paragraph({
                            text: `${index + 1}. ${hazard.description} (Risk: ${hazard.riskLevel})`,
                        })
                    ),
                    new Paragraph({ text: '' }),

                    new Paragraph({
                        text: 'Control Measures',
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...(normalized.controlMeasures || []).map((measure: any, index: number) =>
                        new Paragraph({
                            text: `${index + 1}. ${measure.description}`,
                        })
                    ),
                    new Paragraph({ text: '' }),

                    ...(normalized.methodStatement ? [
                        new Paragraph({
                            text: 'Method Statement',
                            heading: HeadingLevel.HEADING_2,
                        }),
                        new Paragraph({ text: normalized.methodStatement }),
                        new Paragraph({ text: '' }),
                    ] : []),

                    ...(normalized.ppe?.length ? [
                        new Paragraph({
                            text: 'Required PPE',
                            heading: HeadingLevel.HEADING_2,
                        }),
                        ...(normalized.ppe || []).map((item: string) =>
                            new Paragraph({ text: `- ${item}` })
                        ),
                        new Paragraph({ text: '' }),
                    ] : []),

                    ...(normalized.emergencyInfo ? [
                        new Paragraph({
                            text: 'Emergency Arrangements',
                            heading: HeadingLevel.HEADING_2,
                        }),
                        ...(normalized.emergencyInfo.hospital ? [
                            new Paragraph({ text: `Nearest Hospital: ${normalized.emergencyInfo.hospital}` }),
                            new Paragraph({ text: `Address: ${normalized.emergencyInfo.hospitalAddress || 'N/A'}` }),
                            new Paragraph({ text: `Phone: ${normalized.emergencyInfo.hospitalPhone || 'N/A'}` }),
                        ] : []),
                        ...(normalized.emergencyInfo.emergencyContact ? [
                            new Paragraph({ text: `Emergency Contact: ${normalized.emergencyInfo.emergencyContact}` }),
                        ] : []),
                    ] : []),
                ],
            }],
        });

        return await Packer.toBuffer(doc);
    }
}
