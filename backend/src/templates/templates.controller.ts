import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
    constructor(private templatesService: TemplatesService) { }

    @Get()
    async findAll(@Request() req) {
        return this.templatesService.findAll(req.user.organizationId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return this.templatesService.findOne(id, req.user.organizationId);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body('name') name: string,
        @Body('description') description: string,
        @Request() req
    ) {
        if (!file) {
            return { error: 'No file uploaded' };
        }

        return this.templatesService.create(
            file,
            name,
            description || '',
            req.user.organizationId
        );
    }

    @Put(':id/default')
    async setDefault(@Param('id') id: string, @Request() req) {
        return this.templatesService.setDefault(id, req.user.organizationId);
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req) {
        return this.templatesService.delete(id, req.user.organizationId);
    }
}
