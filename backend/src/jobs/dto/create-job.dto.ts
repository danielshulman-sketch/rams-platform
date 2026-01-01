import { IsString, IsNotEmpty, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    projectName: string;

    @IsString()
    @IsOptional()
    referenceNumber?: string;

    @IsString()
    @IsNotEmpty()
    clientName: string;

    @IsString()
    @IsOptional()
    mainContractor?: string;

    @IsString()
    @IsNotEmpty()
    siteAddress: string;

    @IsString()
    @IsNotEmpty()
    sitePostcode: string;

    @IsObject()
    @IsOptional()
    siteCoordinates?: { lat: number; lng: number };

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsString()
    @IsNotEmpty()
    scopeOfWorks: string;

    @IsObject()
    @IsOptional()
    tags?: any;
}
