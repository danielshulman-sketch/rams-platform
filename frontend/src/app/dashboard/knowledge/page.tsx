'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function KnowledgeBasePage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const { data: knowledgeItems, isLoading } = useQuery({
        queryKey: ['knowledge-base', selectedCategory, search],
        queryFn: async () => {
            const response = await api.getKnowledgeBase(selectedCategory, search);
            return response.data;
        },
    });

    const { data: categories } = useQuery({
        queryKey: ['knowledge-categories'],
        queryFn: async () => {
            const response = await api.getKnowledgeCategories();
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteKnowledgeItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Knowledge Base</h1>
                    <p className="text-gray-600 mt-1">Manage reusable safety information for AI-assisted RAMS generation</p>
                </div>
                <Link href="/dashboard/knowledge/new">
                    <Button>Add Knowledge Item</Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Search knowledge base..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories?.map((cat: string) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Knowledge Items */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : knowledgeItems?.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Knowledge Items Yet</CardTitle>
                        <CardDescription>
                            Add safety procedures, hazard information, and best practices to help AI generate better RAMS
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/knowledge/new">
                            <Button>Add Your First Knowledge Item</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {knowledgeItems?.map((item: any) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle>{item.title}</CardTitle>
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                {item.category}
                                            </span>
                                        </div>
                                        <CardDescription className="mt-2">
                                            {item.content.substring(0, 150)}...
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/knowledge/${item.id}`}>
                                            <Button size="sm" variant="outline">View</Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                if (confirm('Delete this knowledge item?')) {
                                                    deleteMutation.mutate(item.id);
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            {item.tags?.length > 0 && (
                                <CardContent>
                                    <div className="flex gap-2 flex-wrap">
                                        {item.tags.map((tag: string) => (
                                            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
