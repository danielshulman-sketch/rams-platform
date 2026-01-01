import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
    constructor(private organizationsService: OrganizationsService) { }

    @Get('me')
    async getMyOrganization(@Request() req) {
        return this.organizationsService.findOne(req.user.organizationId);
    }

    @Put('me')
    async updateMyOrganization(@Request() req, @Body() data: any) {
        return this.organizationsService.update(req.user.organizationId, data);
    }
}
