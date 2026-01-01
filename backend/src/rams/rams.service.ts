import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRamsDto } from './dto/create-rams.dto';
import { ExportService } from './export.service';

@Injectable()
export class RamsService {
    private exportService = new ExportService();

    constructor(private prisma: PrismaService) { }

    async create(createRamsDto: CreateRamsDto, userId: string, organizationId: string) {
        const { jobId, title, content, status = 'draft' } = createRamsDto;

        // Create RAMS document
        const rams = await (this.prisma as any).ramsDocument.create({
            data: {
                jobId,
                organizationId,
                title,
                content: JSON.stringify(content),
                status,
                version: 1,
                createdById: userId,
            },
            include: {
                job: true,
                createdBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Version history disabled for now
        /*
        await this.prisma.ramsVersion.create({
            data: {
                ramsId: rams.id,
                versionNumber: 1,
                content,
                changedById: userId,
                changeSummary: 'Initial version',
            },
        });
        */

        return rams;
    }

    async findAll(organizationId: string) {
        const docs = await (this.prisma as any).ramsDocument.findMany({
            where: { organizationId },
            include: {
                job: {
                    select: {
                        projectName: true,
                        clientName: true,
                    },
                },
                createdBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Parse content
        return docs.map(doc => ({
            ...doc,
            content: doc.content && typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content
        }));
    }

    async findOne(id: string, organizationId: string) {
        const result = await (this.prisma as any).ramsDocument.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                job: true,
                createdBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                approvedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (result && result.content && typeof result.content === 'string') {
            result.content = JSON.parse(result.content);
        }
        return result;
    }

    async update(
        id: string,
        updateData: Partial<CreateRamsDto>,
        userId: string,
        organizationId: string,
        changeSummary?: string,
    ) {
        const currentRams = await (this.prisma as any).ramsDocument.findFirst({
            where: { id, organizationId },
        });

        if (!currentRams) {
            throw new Error('RAMS not found');
        }

        // Increment version
        const newVersion = currentRams.version + 1;

        // Update RAMS document
        const rams = await (this.prisma as any).ramsDocument.update({
            where: { id },
            data: {
                ...updateData,
                content: updateData.content ? JSON.stringify(updateData.content) : undefined,
                version: { increment: 1 },
            },
            include: {
                job: true,
                createdBy: {
                    select: {
                        firstName: true,
                    },
                },
            },
        });

        /*
        await this.prisma.ramsVersion.create({
            data: {
                ramsId: id,
                versionNumber: newVersion,
                content: updateData.content || currentRams.content,
                changedById: userId,
                changeSummary: changeSummary || 'Updated RAMS',
            },
        });
        */

        return rams;
    }

    async approve(id: string, userId: string, organizationId: string) {
        return (this.prisma as any).ramsDocument.updateMany({
            where: {
                id,
                organizationId,
            },
            data: {
                status: 'approved',
                approvedById: userId,
                approvedAt: new Date(),
            },
        });
    }

    async remove(id: string, organizationId: string) {
        return (this.prisma as any).ramsDocument.deleteMany({
            where: {
                id,
                organizationId,
            },
        });
    }

    async exportDocument(
        id: string,
        organizationId: string,
        format: string,
        templateId?: string,
    ): Promise<Buffer> {
        const rams = await this.findOne(id, organizationId);

        if (!rams) {
            throw new Error('RAMS not found');
        }

        // Parse content from JSON
        const ramsData = typeof rams.content === 'string' ? JSON.parse(rams.content) : rams.content;

        // Add job details
        const exportData = {
            ...ramsData,
            jobNumber: rams.job?.referenceNumber || 'N/A',
            projectName: rams.job?.projectName || 'N/A',
        };

        // Generate document based on format
        if (format === 'docx') {
            return await this.exportService.generateWord(exportData);
        } else {
            return await this.exportService.generatePDF(exportData);
        }
    }
}
