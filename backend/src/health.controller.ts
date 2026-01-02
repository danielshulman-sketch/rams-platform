import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async check() {
        try {
            // Simple query to check DB connection
            await (this.prisma as any).$queryRaw`SELECT 1`;
            return {
                status: 'ok',
                database: 'connected',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}
