import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body, Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, Permissions } from '../auth/guards/permissions.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
    constructor(private jobsService: JobsService) { }

    @Post()
    @UseGuards(PermissionsGuard)
    @Permissions('jobs.create')
    async create(@Body() createJobDto: CreateJobDto, @Request() req) {
        return this.jobsService.create(
            createJobDto,
            req.user.id,
            req.user.organizationId,
        );
    }

    @Get()
    async findAll(@Request() req) {
        return this.jobsService.findAll(req.user.organizationId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return this.jobsService.findOne(id, req.user.organizationId);
    }

    @Put(':id')
    @UseGuards(PermissionsGuard)
    @Permissions('jobs.edit')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<CreateJobDto>,
        @Request() req,
    ) {
        return this.jobsService.update(id, updateData, req.user.organizationId);
    }

    @Delete(':id')
    @UseGuards(PermissionsGuard)
    @Permissions('jobs.delete')
    async remove(@Param('id') id: string, @Request() req) {
        return this.jobsService.remove(id, req.user.organizationId);
    }
}
