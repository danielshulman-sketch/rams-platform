import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(StorageService.name);
    private bucketName = 'rams-uploads';

    constructor() {
        const projectUrl = process.env.SUPABASE_URL;
        const anonKey = process.env.SUPABASE_ANON_KEY;

        if (!projectUrl || !anonKey) {
            this.logger.warn('Supabase credentials not found. File storage will not work.');
            return;
        }

        this.supabase = createClient(projectUrl, anonKey);
    }

    async uploadFile(
        fileBuffer: Buffer,
        fileName: string,
        contentType: string,
        folder: string = 'templates'
    ): Promise<string> {
        if (!this.supabase) {
            throw new Error('Storage not configured');
        }

        const path = `${folder}/${fileName}`;
        const { data, error } = await this.supabase
            .storage
            .from(this.bucketName)
            .upload(path, fileBuffer, {
                contentType,
                upsert: true,
            });

        if (error) {
            this.logger.error(`Upload failed: ${error.message}`);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = this.supabase
            .storage
            .from(this.bucketName)
            .getPublicUrl(path);

        return publicUrl;
    }

    async deleteFile(path: string): Promise<void> {
        if (!this.supabase) return;

        // Extract relative path from URL if needed, or assume path is relative
        const cleanPath = path.split(`${this.bucketName}/`).pop();

        const { error } = await this.supabase
            .storage
            .from(this.bucketName)
            .remove([cleanPath]);

        if (error) {
            this.logger.error(`Delete failed: ${error.message}`);
            throw error;
        }
    }
}
