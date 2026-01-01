import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    UseGuards,
    Request,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
    constructor(private uploadService: UploadService) { }

    @Post('extract-job')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
            },
            fileFilter: (req, file, cb) => {
                if (file.mimetype !== 'application/pdf') {
                    return cb(
                        new BadRequestException('Only PDF files are allowed'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async extractJobFromPDF(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const extracted = await this.uploadService.extractJobFromPDF(file.buffer);
        return extracted;
    }

    @Post('extract-scope')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
            fileFilter: (req, file, cb) => {
                if (file.mimetype !== 'application/pdf') {
                    return cb(
                        new BadRequestException('Only PDF files are allowed'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async extractScopeData(@UploadedFile() file: Express.Multer.File, @Request() req) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const extracted = await this.uploadService.extractRamsDataFromScope(
            file.buffer,
            req.user.organizationId
        );
        return extracted;
    }

    @Post('generate-rams')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
            fileFilter: (req, file, cb) => {
                if (file.mimetype !== 'application/pdf') {
                    return cb(
                        new BadRequestException('Only PDF files are allowed'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async generateRams(
        @UploadedFile() file: Express.Multer.File,
        @Body('jobDetails') jobDetailsStr: string,
        @Request() req
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const pdfParse = require('pdf-parse');
        const data = await pdfParse(file.buffer);
        const scopeText = data.text;

        const jobDetails = jobDetailsStr ? JSON.parse(jobDetailsStr) : null;

        const ramsData = await this.uploadService.generateRamsWithAI(
            scopeText,
            req.user.organizationId,
            jobDetails
        );

        return ramsData;
    }
}
