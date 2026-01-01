'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function RamsPage() {
    const { data: rams, isLoading, error } = useQuery({
        queryKey: ['rams'],
        queryFn: async () => {
            const response = await api.getRams();
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading RAMS...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-50 rounded-md">
                Failed to load RAMS. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">RAMS Documents</h1>
                    <p className="text-gray-600 mt-1">Risk Assessment & Method Statements</p>
                </div>
                <Link href="/dashboard/rams/new">
                    <Button>Create New RAMS</Button>
                </Link>
            </div>

            {rams && rams.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No RAMS yet</CardTitle>
                        <CardDescription>
                            Create your first RAMS document to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/rams/new">
                            <Button>Create Your First RAMS</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {rams?.map((doc: any) => (
                        <Link key={doc.id} href={`/dashboard/rams/${doc.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle>{doc.title}</CardTitle>
                                                <span className={`
                          px-2 py-0.5 text-xs font-medium rounded-full
                          ${doc.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                          ${doc.status === 'review' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${doc.status === 'draft' ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                            <CardDescription className="mt-1">
                                                {doc.job?.projectName} • {doc.job?.clientName}
                                            </CardDescription>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            v{doc.version}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600">
                                        Created by {doc.createdBy?.firstName} {doc.createdBy?.lastName} on{' '}
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
