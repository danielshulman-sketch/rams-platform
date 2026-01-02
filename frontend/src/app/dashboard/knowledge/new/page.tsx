'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';

export default function NewKnowledgePage() {
    const router = useRouter();
    const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'safety_procedures',
        tags: '',
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.createKnowledgeItem(data),
        onSuccess: () => {
            router.push('/dashboard/knowledge');
        },
    });

    const uploadMutation = useMutation({
        mutationFn: (files: File[]) => api.uploadKnowledgeFiles(files),
        onSuccess: (response) => {
            router.push('/dashboard/knowledge');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadMode === 'file' && selectedFiles.length > 0) {
            uploadMutation.mutate(selectedFiles);
        } else {
            createMutation.mutate({
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedFiles(files);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add Knowledge Item</h1>
                <p className="text-gray-600 mt-1">Add safety information to help AI generate better RAMS</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Knowledge Details</CardTitle>
                        <CardDescription>
                            Add procedures, hazards, controls, or any safety information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Upload Mode Selector */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setUploadMode('text')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${uploadMode === 'text'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Type Content
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadMode('file')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${uploadMode === 'file'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Upload Document
                            </button>
                        </div>

                        {uploadMode === 'file' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="file">Upload PDF or Word Documents</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        multiple
                                        required={selectedFiles.length === 0}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Upload one or more PDF or Word documents. Text will be automatically extracted from each.
                                    </p>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Selected Files ({selectedFiles.length})</Label>
                                        <div className="space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="text-sm font-medium text-green-900">
                                                            {file.name}
                                                        </span>
                                                        <span className="text-xs text-green-700">
                                                            ({(file.size / 1024).toFixed(1)} KB)
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Working at Height - Safety Procedures"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                    >
                                        <option value="safety_procedures">Safety Procedures</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="regulations">Regulations</option>
                                        <option value="hazards">Hazards</option>
                                        <option value="controls">Control Measures</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        rows={12}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="Detailed safety information, procedures, hazards, or examples..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        This information will be used by AI to generate relevant RAMS content
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                                    <Input
                                        id="tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="scaffolding, height, fall protection"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Add tags to help find this knowledge item later
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || uploadMutation.isPending}>
                                {(createMutation.isPending || uploadMutation.isPending)
                                    ? 'Creating...'
                                    : uploadMode === 'file' && selectedFiles.length > 1
                                        ? `Create ${selectedFiles.length} Knowledge Items`
                                        : 'Create Knowledge Item'}
                            </Button>
                        </div>

                        {(createMutation.isError || uploadMutation.isError) && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                Failed to create knowledge item. Please try again.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
