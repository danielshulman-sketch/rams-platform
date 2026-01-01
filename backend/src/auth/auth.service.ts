import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(data: RegisterDto): Promise<any> {
        const { email, password, firstName, lastName, organizationName } = data;

        // Check if user exists
        const existingUser = await (this.prisma as any).user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create organization first
        const organization = await (this.prisma as any).organization.create({
            data: {
                name: organizationName,
                settings: JSON.stringify({}),
            },
        });

        // Create default roles for the organization
        const adminRole = await (this.prisma as any).role.create({
            data: {
                organizationId: organization.id,
                name: 'Admin',
                permissions: JSON.stringify([
                    'rams.create',
                    'rams.edit',
                    'rams.delete',
                    'rams.export',
                    'jobs.create',
                    'jobs.edit',
                    'jobs.delete',
                    'templates.manage',
                    'users.manage',
                    'org.settings',
                ]),
            },
        });

        await (this.prisma as any).role.create({
            data: {
                organizationId: organization.id,
                name: 'Standard',
                permissions: JSON.stringify([
                    'rams.create',
                    'rams.edit',
                    'rams.export',
                    'jobs.create',
                    'jobs.edit',
                ]),
            },
        });

        await (this.prisma as any).role.create({
            data: {
                organizationId: organization.id,
                name: 'ReadOnly',
                permissions: JSON.stringify(['rams.view', 'jobs.view']),
            },
        });

        // Create user with Admin role
        const user = await (this.prisma as any).user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                organizationId: organization.id,
                roleId: adminRole.id,
            },
            include: {
                organization: true,
                role: true,
            },
        });

        // Generate JWT token
        const token = this.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name,
                organization: {
                    id: user.organization.id,
                    name: user.organization.name,
                },
            },
            token,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user with organization and role
        const user = await (this.prisma as any).user.findUnique({
            where: { email },
            include: {
                organization: true,
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is disabled');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const token = this.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name,
                permissions: JSON.parse(user.role.permissions),
                organization: {
                    id: user.organization.id,
                    name: user.organization.name,
                },
            },
            token,
        };
    }

    async validateUser(userId: string): Promise<any> {
        const user = await (this.prisma as any).user.findUnique({
            where: { id: userId },
            include: {
                organization: true,
                role: true,
            },
        });

        if (!user || !user.isActive) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            organizationId: user.organizationId,
            role: user.role.name,
            permissions: JSON.parse(user.role.permissions),
        };
    }

    private generateToken(user: any): string {
        const payload = {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
            roleId: user.roleId,
        };

        return this.jwtService.sign(payload);
    }
}
