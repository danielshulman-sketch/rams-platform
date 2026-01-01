import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateRamsDto {
    @IsString()
    @IsNotEmpty()
    jobId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsObject()
    @IsNotEmpty()
    content: any; // JSONB content with all RAMS sections

    @IsEnum(['draft', 'review', 'approved'])
    @IsOptional()
    status?: string;
}
