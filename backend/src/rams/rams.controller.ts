import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    Query,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RamsService } from './rams.service';
import { CreateRamsDto } from './dto/create-rams.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, Permissions } from '../auth/guards/permissions.guard';

@Controller('rams')
@UseGuards(JwtAuthGuard)
export class RamsController {
    constructor(private ramsService: RamsService) { }

    @Post()
    @UseGuards(PermissionsGuard)
    @Permissions('rams.create')
    async create(@Body() createRamsDto: CreateRamsDto, @Request() req) {
        return this.ramsService.create(
            createRamsDto,
            req.user.id,
            req.user.organizationId,
        );
    }

    @Get()
    async findAll(@Request() req) {
        return this.ramsService.findAll(req.user.organizationId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return this.ramsService.findOne(id, req.user.organizationId);
    }

    @Get(':id/export')
    async export(
        @Param('id') id: string,
        @Query('format') format: string,
        @Query('templateId') templateId: string,
        @Request() req,
        @Res() res: Response,
    ) {
        const buffer = await this.ramsService.exportDocument(
            id,
            req.user.organizationId,
            format || 'pdf',
            templateId,
        );

        const rams = await this.ramsService.findOne(id, req.user.organizationId);
        const jobRef = rams.job?.referenceNumber || 'RAMS';
        const title = rams.title || 'document';
        const filename = `${jobRef}-${title.replace(/[^a-z0-9]/gi, '_')}.${format || 'pdf'}`;

        res.set({
            'Content-Type': format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    }

    @Put(':id')
    @UseGuards(PermissionsGuard)
    @Permissions('rams.edit')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<CreateRamsDto> & { changeSummary?: string },
        @Request() req,
    ) {
        const { changeSummary, ...data } = updateData;
        return this.ramsService.update(
            id,
            data,
            req.user.id,
            req.user.organizationId,
            changeSummary,
        );
    }

    @Put(':id/approve')
    @UseGuards(PermissionsGuard)
    @Permissions('rams.edit')
    async approve(@Param('id') id: string, @Request() req) {
        return this.ramsService.approve(id, req.user.id, req.user.organizationId);
    }

    @Delete(':id')
    @UseGuards(PermissionsGuard)
    @Permissions('rams.delete')
    async remove(@Param('id') id: string, @Request() req) {
        return this.ramsService.remove(id, req.user.organizationId);
    }
}
