import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { JobsModule } from './jobs/jobs.module';
import { RamsModule } from './rams/rams.module';
import { TemplatesModule } from './templates/templates.module';
import { DocumentsModule } from './documents/documents.module';
import { UploadModule } from './upload/upload.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { AiModule } from './ai/ai.module';
import { StorageModule } from './storage/storage.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        OrganizationsModule,
        JobsModule,
        RamsModule,
        TemplatesModule,
        DocumentsModule,
        UploadModule,
        HospitalsModule,
        KnowledgeBaseModule,
        AiModule,
        StorageModule,
    ],
})
export class AppModule { }
