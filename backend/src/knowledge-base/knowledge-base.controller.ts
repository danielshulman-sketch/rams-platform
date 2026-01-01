import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from './dto/knowledge-base.dto';

@Controller('knowledge-base')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
    constructor(private knowledgeBaseService: KnowledgeBaseService) { }

    @Get()
    async findAll(@Request() req, @Query('category') category?: string, @Query('search') search?: string) {
        return this.knowledgeBaseService.findAll(req.user.organizationId, category, search);
    }

    @Get('categories')
    async getCategories(@Request() req) {
        return this.knowledgeBaseService.getCategories(req.user.organizationId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return this.knowledgeBaseService.findOne(id, req.user.organizationId);
    }

    @Post()
    async create(@Body() dto: CreateKnowledgeBaseDto, @Request() req) {
        return this.knowledgeBaseService.create(dto, req.user.organizationId, req.user.userId);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
        if (!file) {
            return { error: 'No file uploaded' };
        }

        let extractedText = '';
        let fileType = '';

        // Extract text based on file type
        if (file.mimetype === 'application/pdf') {
            // Extract text from PDF
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(file.buffer);
            extractedText = data.text;
            fileType = 'pdf';
        } else if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword'
        ) {
            // Extract text from Word document
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            extractedText = result.value;
            fileType = 'docx';
        } else {
            return { error: 'Unsupported file type. Please upload PDF or Word documents.' };
        }

        // Create knowledge base item with extracted content
        const knowledgeItem = await this.knowledgeBaseService.create(
            {
                title: file.originalname.replace(/\.[^/.]+$/, ''),
                content: extractedText,
                category: 'general',
                fileType: fileType,
                tags: [],
            },
            req.user.organizationId,
            req.user.userId
        );

        return knowledgeItem;
    }

    @Post('upload-bulk')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[], @Request() req) {
        if (!files || files.length === 0) {
            return { error: 'No files uploaded' };
        }

        const results = [];
        const errors = [];

        // Process each file
        for (const file of files) {
            try {
                let extractedText = '';
                let fileType = '';

                // Extract text based on file type
                if (file.mimetype === 'application/pdf') {
                    const pdfParse = require('pdf-parse');
                    const data = await pdfParse(file.buffer);
                    extractedText = data.text;
                    fileType = 'pdf';
                } else if (
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.mimetype === 'application/msword'
                ) {
                    const mammoth = require('mammoth');
                    const result = await mammoth.extractRawText({ buffer: file.buffer });
                    extractedText = result.value;
                    fileType = 'docx';
                } else {
                    errors.push({ filename: file.originalname, error: 'Unsupported file type' });
                    continue;
                }

                // Create knowledge base item
                const knowledgeItem = await this.knowledgeBaseService.create(
                    {
                        title: file.originalname.replace(/\.[^/.]+$/, ''),
                        content: extractedText,
                        category: 'general',
                        fileType: fileType,
                        tags: [],
                    },
                    req.user.organizationId,
                    req.user.userId
                );

                results.push(knowledgeItem);
            } catch (error) {
                errors.push({ filename: file.originalname, error: error.message });
            }
        }

        return {
            success: results.length,
            created: results,
            failed: errors.length,
            errors: errors,
        };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateKnowledgeBaseDto, @Request() req) {
        return this.knowledgeBaseService.update(id, dto, req.user.organizationId);
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req) {
        return this.knowledgeBaseService.delete(id, req.user.organizationId);
    }
}
