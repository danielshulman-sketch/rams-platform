import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
    constructor(private prisma: PrismaService) { }

    async create(createJobDto: CreateJobDto, userId: string, organizationId: string) {
        return (this.prisma as any).job.create({
            data: {
                ...createJobDto,
                startDate: createJobDto.startDate ? new Date(createJobDto.startDate) : null,
                endDate: createJobDto.endDate ? new Date(createJobDto.endDate) : null,
                createdById: userId,
                organizationId,
            },
            include: {
                createdBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findAll(organizationId: string) {
        return (this.prisma as any).job.findMany({
            where: { organizationId },
            include: {
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
    }

    async findOne(id: string, organizationId: string) {
        return (this.prisma as any).job.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                createdBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                ramsDocuments: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        version: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    async update(id: string, updateData: Partial<CreateJobDto>, organizationId: string) {
        return (this.prisma as any).job.updateMany({
            where: {
                id,
                organizationId,
            },
            data: {
                ...updateData,
                startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
                endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
            },
        });
    }

    async remove(id: string, organizationId: string) {
        return (this.prisma as any).job.deleteMany({
            where: {
                id,
                organizationId,
            },
        });
    }
}
