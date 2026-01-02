import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module'; // Adjust path if necessary
import { HttpExceptionFilter } from '../src/http-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

const createNestServer = async (expressInstance: any) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );

    app.enableCors({
        origin: process.env.FRONTEND_URL || '*', // Allow all or specific frontend
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.setGlobalPrefix('api');

    await app.init();
    return app;
};

// Initialize the app (cached for subsequent requests in the same container)
let appPromise: Promise<any>;

export default async function handler(req: any, res: any) {
    if (!appPromise) {
        appPromise = createNestServer(server);
    }
    await appPromise;
    server(req, res);
}
