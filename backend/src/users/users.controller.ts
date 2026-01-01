import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, Permissions } from '../auth/guards/permissions.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @UseGuards(PermissionsGuard)
    @Permissions('users.manage')
    async findAll(@Request() req) {
        return this.usersService.findAll(req.user.organizationId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return this.usersService.findOne(id, req.user.organizationId);
    }
}
