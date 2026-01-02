'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import mammoth from 'mammoth';

const jobSchema = z.object({
    projectName: z.string().min(1, 'Project name is required'),
    referenceNumber: z.string().optional(),
    clientName: z.string().min(1, 'Client name is required'),
    mainContractor: z.string().optional(),
    siteAddress: z.string().min(1, 'Site address is required'),
    sitePostcode: z.string().min(1, 'Postcode is required'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    scopeOfWorks: z.string().min(1, 'Scope of works is required'),
});

type JobForm = z.infer<typeof jobSchema>;

export default function NewJobPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<JobForm>({
        resolver: zodResolver(jobSchema),
    });

    const extractTextFromDOCX = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    };

    const extractTextFromTXT = async (file: File): Promise<string> => {
        return await file.text();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadStatus('Processing document...');
        setError('');

        try {
            let extractedText = '';

            // Handle PDF files - send to backend for AI extraction
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                setUploadStatus('AI is reading your PDF...');

                const response = await api.uploadJobPDF(file);
                const data = response.data;

                // Auto-fill ALL form fields
                if (data.projectName) setValue('projectName', data.projectName);
                if (data.clientName) setValue('clientName', data.clientName);
                if (data.mainContractor) setValue('mainContractor', data.mainContractor);
                if (data.siteAddress) setValue('siteAddress', data.siteAddress);
                if (data.sitePostcode) setValue('sitePostcode', data.sitePostcode);
                if (data.startDate) setValue('startDate', data.startDate);
                if (data.endDate) setValue('endDate', data.endDate);
                if (data.scopeOfWorks) setValue('scopeOfWorks', data.scopeOfWorks);
                if (data.referenceNumber) setValue('referenceNumber', data.referenceNumber);

                const fieldsExtracted = [
                    data.projectName,
                    data.clientName,
                    data.siteAddress,
                    data.sitePostcode,
                    data.scopeOfWorks
                ].filter(Boolean).length;

                setUploadStatus(`✓ Auto-filled ${fieldsExtracted} fields (${Math.round(data.confidence * 100)}% confidence)`);
            }
            // Handle DOCX and TXT files - client-side extraction
            else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
                extractedText = await extractTextFromDOCX(file);
                setValue('scopeOfWorks', extractedText);
                setUploadStatus(`✓ Extracted ${extractedText.length} characters from ${file.name}`);
            } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                extractedText = await extractTextFromTXT(file);
                setValue('scopeOfWorks', extractedText);
                setUploadStatus(`✓ Extracted ${extractedText.length} characters from ${file.name}`);
            } else {
                throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
            }

            setTimeout(() => setUploadStatus(''), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to extract text from document');
            setUploadStatus('');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const onSubmit = async (data: JobForm) => {
        setLoading(true);
        setError('');

        try {
            const response = await api.createJob(data);
            router.push(`/dashboard/jobs/${response.data.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create New Job</h1>
                <p className="text-gray-600 mt-1">Add project details and site information</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                    <CardDescription>
                        Enter the project and site information for this job
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Project Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Project Information</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projectName">Project Name *</Label>
                                    <Input
                                        id="projectName"
                                        {...register('projectName')}
                                        placeholder="Steel Beam Installation"
                                        disabled={loading}
                                    />
                                    {errors.projectName && (
                                        <p className="text-sm text-red-600">{errors.projectName.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="referenceNumber">Reference Number</Label>
                                    <Input
                                        id="referenceNumber"
                                        {...register('referenceNumber')}
                                        placeholder="JOB-2024-001"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="clientName">Client Name *</Label>
                                    <Input
                                        id="clientName"
                                        {...register('clientName')}
                                        placeholder="ABC Construction Ltd"
                                        disabled={loading}
                                    />
                                    {errors.clientName && (
                                        <p className="text-sm text-red-600">{errors.clientName.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mainContractor">Main Contractor</Label>
                                    <Input
                                        id="mainContractor"
                                        {...register('mainContractor')}
                                        placeholder="XYZ Builders"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Site Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Site Information</h3>

                            <div className="space-y-2">
                                <Label htmlFor="siteAddress">Site Address *</Label>
                                <Input
                                    id="siteAddress"
                                    {...register('siteAddress')}
                                    placeholder="123 High Street, London"
                                    disabled={loading}
                                />
                                {errors.siteAddress && (
                                    <p className="text-sm text-red-600">{errors.siteAddress.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sitePostcode">Postcode *</Label>
                                <Input
                                    id="sitePostcode"
                                    {...register('sitePostcode')}
                                    placeholder="SW1A 1AA"
                                    disabled={loading}
                                />
                                {errors.sitePostcode && (
                                    <p className="text-sm text-red-600">{errors.sitePostcode.message}</p>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        {...register('startDate')}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        {...register('endDate')}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scope of Works */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Scope of Works</h3>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label>Upload Scope Document (Optional)</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploading || loading}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading || loading}
                                    >
                                        {uploading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Upload PDF to Auto-Fill
                                            </>
                                        )}
                                    </Button>
                                    {uploadStatus && (
                                        <span className="text-sm text-green-600">{uploadStatus}</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Upload a document to automatically extract the scope of works
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="scopeOfWorks">Description *</Label>
                                <textarea
                                    id="scopeOfWorks"
                                    {...register('scopeOfWorks')}
                                    rows={6}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Installation of structural steel beams on the 3rd floor. Work to be carried out using MEWP for access. Hot works required for welding connections..."
                                    disabled={loading}
                                />
                                {errors.scopeOfWorks && (
                                    <p className="text-sm text-red-600">{errors.scopeOfWorks.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Job'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
