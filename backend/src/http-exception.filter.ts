
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorLog = `
Timestamp: ${new Date().toISOString()}
Path: ${request.url}
Method: ${request.method}
Status: ${status}
User: ${JSON.stringify((request as any).user?.email || 'unauthenticated')}
Error: ${JSON.stringify(exception instanceof Error ? exception.message : exception)}
Stack: ${exception instanceof Error ? exception.stack : ''}
----------------------------------------
`;

        // Write to log file
        const logPath = path.join(__dirname, '../../backend-error.log');
        try {
            fs.appendFileSync(logPath, errorLog);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }

        response
            .status(status)
            .json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: exception instanceof Error ? exception.message : 'Internal server error',
            });
    }
}
