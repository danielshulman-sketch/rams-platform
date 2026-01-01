import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from './dto/knowledge-base.dto';

@Injectable()
export class KnowledgeBaseService {
    constructor(private prisma: PrismaService) { }

    async findAll(organizationId: string, category?: string, search?: string) {
        const where: any = {
            organizationId,
            isActive: true,
        };

        if (category) {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { content: { contains: search } },
                { tags: { contains: search } },
            ];
        }

        return (this.prisma as any).knowledgeBaseItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, organizationId: string) {
        return (this.prisma as any).knowledgeBaseItem.findFirst({
            where: { id, organizationId },
        });
    }

    async create(dto: CreateKnowledgeBaseDto, organizationId: string, userId?: string) {
        return (this.prisma as any).knowledgeBaseItem.create({
            data: {
                ...dto,
                organizationId,
                category: dto.category || 'general',
                tags: Array.isArray(dto.tags) ? dto.tags.join(',') : (dto.tags || ''),
            },
        });
    }

    async update(id: string, dto: UpdateKnowledgeBaseDto, organizationId: string) {
        return (this.prisma as any).knowledgeBaseItem.updateMany({
            where: { id, organizationId },
            data: dto,
        });
    }

    async delete(id: string, organizationId: string) {
        // Soft delete by setting isActive to false
        return (this.prisma as any).knowledgeBaseItem.updateMany({
            where: { id, organizationId },
            data: { isActive: false },
        });
    }

    async getCategories(organizationId: string) {
        const items = await (this.prisma as any).knowledgeBaseItem.findMany({
            where: { organizationId, isActive: true },
            select: { category: true },
            distinct: ['category'],
        });
        return items.map(item => item.category);
    }
}
