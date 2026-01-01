'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function TemplatesPage() {
    const queryClient = useQueryClient();
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');

    const { data: templates, isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => {
            const response = await api.getTemplates();
            return response.data;
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (data: { file: File; name: string; description: string }) => {
            const formData = new FormData();
            formData.append('file', data.file);
            formData.append('name', data.name);
            formData.append('description', data.description);
            return api.uploadTemplate(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setUploadFile(null);
            setTemplateName('');
            setTemplateDescription('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => api.setDefaultTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadFile && templateName) {
            uploadMutation.mutate({
                file: uploadFile,
                name: templateName,
                description: templateDescription,
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">RAMS Templates</h1>
                <p className="text-gray-600 mt-1">Upload Word/PDF templates for custom RAMS formatting</p>
            </div>

            {/* Upload New Template */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload New Template</CardTitle>
                    <CardDescription>
                        Upload a Word (.docx) or PDF template. Use placeholders like {'{{projectName}}'}, {'{{hazards}}'}, etc.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Standard RAMS Template"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Input
                                id="description"
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                                placeholder="Used for construction site RAMS"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">Template File</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".docx,.pdf"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Supported formats: Word (.docx), PDF (.pdf)
                            </p>
                        </div>

                        <Button type="submit" disabled={uploadMutation.isPending}>
                            {uploadMutation.isPending ? 'Uploading...' : 'Upload Template'}
                        </Button>

                        {uploadMutation.isError && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                Failed to upload template. Please try again.
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Templates List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Templates</CardTitle>
                    <CardDescription>Manage your RAMS output templates</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading templates...</div>
                    ) : templates?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No templates yet. Upload your first template above.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {templates?.map((template: any) => (
                                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{template.name}</h3>
                                            {template.isDefault && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        {template.description && (
                                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {template.fileType?.toUpperCase()} • Uploaded {new Date(template.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!template.isDefault && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setDefaultMutation.mutate(template.id)}
                                            >
                                                Set as Default
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                if (confirm(`Delete template "${template.name}"?`)) {
                                                    deleteMutation.mutate(template.id);
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
