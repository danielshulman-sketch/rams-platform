import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class TemplatesService {
    private uploadDir = path.join(process.cwd(), 'uploads', 'templates');

    constructor(
        private prisma: PrismaService,
        private storageService: StorageService,
    ) { }

    async findAll(organizationId: string) {
        return (this.prisma as any).template.findMany({
            where: { organizationId },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }

    async findOne(id: string, organizationId: string) {
        return (this.prisma as any).template.findFirst({
            where: { id, organizationId },
        });
    }

    async create(
        file: Express.Multer.File,
        name: string,
        description: string,
        organizationId: string,
    ) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${Date.now()}-${file.originalname}`;

        // Upload to Supabase Storage
        const fileUrl = await this.storageService.uploadFile(
            file.buffer,
            fileName,
            file.mimetype,
            'templates'
        );

        return (this.prisma as any).template.create({
            data: {
                name,
                description,
                fileUrl: fileUrl,
                fileType: fileExtension.replace('.', ''),
                organizationId,
            },
        });
    }

    async setDefault(id: string, organizationId: string) {
        // Remove default from all templates in org
        await (this.prisma as any).template.updateMany({
            where: { organizationId },
            data: { isDefault: false },
        });

        // Set new default
        return (this.prisma as any).template.update({
            where: { id },
            data: { isDefault: true },
        });
    }

    async delete(id: string, organizationId: string) {
        const template = await (this.prisma as any).template.findFirst({
            where: { id, organizationId },
        });

        if (template && template.fileUrl) {
            try {
                await this.storageService.deleteFile(template.fileUrl);
            } catch (error) {
                console.error('Failed to delete file from storage:', error);
                // Continue to delete record even if storage delete fails
            }
        }

        return (this.prisma as any).template.delete({
            where: { id },
        });
    }
}
