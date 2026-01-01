import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string): Promise<any> {
        return (this.prisma as any).user.findUnique({
            where: { email },
            include: { organization: true, role: true },
        });
    }

    async findOne(id: string, organizationId?: string): Promise<any> {
        const where: any = { id };
        if (organizationId) {
            where.organizationId = organizationId;
        }
        return (this.prisma as any).user.findUnique({
            where,
            include: { organization: true, role: true },
        });
    }

    async create(data: any, organizationId?: string): Promise<any> {
        if (organizationId) {
            data.organizationId = organizationId;
        }
        return (this.prisma as any).user.create({
            data,
        });
    }

    async findAll(organizationId: string): Promise<any> {
        return (this.prisma as any).user.findMany({
            where: { organizationId },
            include: { role: true },
        });
    }

    async update(id: string, data: any): Promise<any> {
        return (this.prisma as any).user.update({
            where: { id },
            data,
        });
    }
}
