import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        return (this.prisma as any).organization.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                settings: true,
                createdAt: true,
            },
        });
    }

    async update(id: string, data: any) {
        return (this.prisma as any).organization.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                logoUrl: true,
                settings: true,
            },
        });
    }
}
