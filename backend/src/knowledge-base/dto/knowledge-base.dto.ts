import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateKnowledgeBaseDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsOptional()
    fileUrl?: string;

    @IsOptional()
    fileType?: string;
}

export class UpdateKnowledgeBaseDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
