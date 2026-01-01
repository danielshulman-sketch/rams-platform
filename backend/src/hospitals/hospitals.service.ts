import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class HospitalsService {
    constructor(private prisma: PrismaService) { }

    async findNearestByPostcode(postcode: string) {
        // First check cache
        const normalizedPostcode = postcode.toUpperCase().replace(/\s/g, '');
        /*
        const cached = await this.prisma.hospitalContact.findUnique({
            where: { postcode: normalizedPostcode },
        });

        if (cached) {
            return cached;
        }
        */

        // If not cached, lookup from API
        const hospital = await this.lookupHospital(postcode);

        if (hospital) {
            // Cache the result
            try {
                /*
                return await this.prisma.hospitalContact.create({
                    data: hospital,
                });
                */
                return hospital; // Return hospital directly if caching is commented out
            } catch (error) {
                // If cache fails, still return the data
                return hospital;
            }
        }

        return null;
    }

    private async lookupHospital(postcode: string) {
        try {
            const normalizedPostcode = postcode.toUpperCase().replace(/\s/g, '');

            // Step 1: Get coordinates from postcode using PostcodesIO (free, no API key needed)
            const postcodeResponse = await axios.get(
                `https://api.postcodes.io/postcodes/${normalizedPostcode}`
            );

            if (!postcodeResponse.data.result) {
                throw new Error('Invalid postcode');
            }

            const { latitude, longitude } = postcodeResponse.data.result;

            // Step 2: Search NHS API for nearby hospitals with A&E
            // Using NHS Organisation Data Service API (free, public)
            const nhsResponse = await axios.get(
                'https://api.nhs.uk/service-search/search',
                {
                    params: {
                        'api-version': 1,
                        search: 'accident and emergency',
                        latitude: latitude,
                        longitude: longitude,
                        maxDistanceMiles: 10,
                    },
                    headers: {
                        'subscription-key': process.env.NHS_API_KEY || 'demo', // Can work without key for limited requests
                    },
                }
            );

            // If NHS API doesn't work, fallback to Google Places or simple search
            if (nhsResponse.data?.value && nhsResponse.data.value.length > 0) {
                const nearestHospital = nhsResponse.data.value[0];
                return {
                    postcode: normalizedPostcode,
                    hospitalName: nearestHospital.OrganisationName || nearestHospital.name,
                    address: nearestHospital.Address1 || nearestHospital.address,
                    phone: nearestHospital.Phone || nearestHospital.contacts?.phone || '111',
                    coordinates: { lat: latitude, lng: longitude },
                };
            }

            // Fallback: Use a simple search for hospitals near the coordinates
            return await this.fallbackHospitalSearch(normalizedPostcode, latitude, longitude);

        } catch (error) {
            console.error('Error looking up hospital:', error.message);
            // Return fallback data
            return {
                postcode: postcode.toUpperCase().replace(/\s/g, ''),
                hospitalName: 'NHS 111',
                address: 'Unable to find nearest hospital. Call NHS 111 for assistance.',
                phone: '111',
                coordinates: null,
            };
        }
    }

    private async fallbackHospitalSearch(postcode: string, lat: number, lng: number) {
        // Fallback to simple local database or hardcoded major hospitals
        const majorHospitals = [
            { name: 'St George\'s Hospital', lat: 51.4278, lng: -0.1733, address: 'Blackshaw Road, Tooting, London, SW17 0QT', phone: '020 8672 1255' },
            { name: 'Royal London Hospital', lat: 51.5176, lng: -0.0597, address: 'Whitechapel Road, London, E1 1FR', phone: '020 3594 0500' },
            { name: 'King\'s College Hospital', lat: 51.4692, lng: -0.0931, address: 'Denmark Hill, London, SE5 9RS', phone: '020 3299 9000' },
            { name: 'Royal Free Hospital', lat: 51.5525, lng: -0.1641, address: 'Pond Street, Hampstead, London, NW3 2QG', phone: '020 7794 0500' },
        ];

        // Find closest by distance
        let nearest = majorHospitals[0];
        let minDistance = this.calculateDistance(lat, lng, nearest.lat, nearest.lng);

        for (const hospital of majorHospitals) {
            const distance = this.calculateDistance(lat, lng, hospital.lat, hospital.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = hospital;
            }
        }

        return {
            postcode,
            hospitalName: nearest.name,
            address: nearest.address,
            phone: nearest.phone,
            coordinates: { lat, lng },
        };
    }

    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        // Haversine formula for distance in km
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
