import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HospitalsService } from './hospitals.service';

@Controller('hospitals')
@UseGuards(JwtAuthGuard)
export class HospitalsController {
    constructor(private hospitalsService: HospitalsService) { }

    @Get('lookup')
    async lookupByPostcode(@Query('postcode') postcode: string) {
        if (!postcode) {
            return { error: 'Postcode is required' };
        }

        const hospital = await this.hospitalsService.findNearestByPostcode(postcode);
        return hospital || { error: 'No hospital found for this postcode' };
    }
}
