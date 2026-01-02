'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const { data: job, isLoading, error } = useQuery({
        queryKey: ['job', jobId],
        queryFn: async () => {
            const response = await api.getJob(jobId);
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading job details...</div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="space-y-4">
                <div className="p-4 text-red-600 bg-red-50 rounded-md">
                    Job not found or failed to load.
                </div>
                <Button onClick={() => router.push('/jobs')}>Back to Jobs</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{job.projectName}</h1>
                    <p className="text-gray-600 mt-1">{job.clientName}</p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/dashboard/rams/new?jobId=${job.id}`}>
                        <Button>Create RAMS</Button>
                    </Link>
                    <Button variant="outline" onClick={() => router.push('/jobs')}>
                        Back to Jobs
                    </Button>
                </div>
            </div>

            {/* Job Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {job.referenceNumber && (
                        <div>
                            <div className="text-sm font-medium text-gray-500">Reference Number</div>
                            <div className="mt-1">{job.referenceNumber}</div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Client</div>
                            <div className="mt-1">{job.clientName}</div>
                        </div>

                        {job.mainContractor && (
                            <div>
                                <div className="text-sm font-medium text-gray-500">Main Contractor</div>
                                <div className="mt-1">{job.mainContractor}</div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-500">Site Address</div>
                        <div className="mt-1">
                            {job.siteAddress}<br />
                            {job.sitePostcode}
                        </div>
                    </div>

                    {(job.startDate || job.endDate) && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {job.startDate && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Start Date</div>
                                    <div className="mt-1">{new Date(job.startDate).toLocaleDateString()}</div>
                                </div>
                            )}

                            {job.endDate && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">End Date</div>
                                    <div className="mt-1">{new Date(job.endDate).toLocaleDateString()}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <div className="text-sm font-medium text-gray-500">Scope of Works</div>
                        <div className="mt-1 whitespace-pre-wrap">{job.scopeOfWorks}</div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="text-sm text-gray-500">
                            Created by {job.createdBy?.firstName} {job.createdBy?.lastName} on{' '}
                            {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* RAMS List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>RAMS Documents</CardTitle>
                            <CardDescription>Risk assessments for this job</CardDescription>
                        </div>
                        <Link href={`/dashboard/rams/new?jobId=${job.id}`}>
                            <Button size="sm">Create RAMS</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {job.ramsDocuments && job.ramsDocuments.length > 0 ? (
                        <div className="space-y-3">
                            {job.ramsDocuments.map((rams: any) => (
                                <Link key={rams.id} href={`/dashboard/rams/${rams.id}`}>
                                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{rams.title}</div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Version {rams.version} • Created {new Date(rams.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${rams.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                          ${rams.status === 'review' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${rams.status === 'draft' ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                                                    {rams.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No RAMS documents yet. Create one to get started.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
