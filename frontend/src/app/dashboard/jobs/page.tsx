'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function JobsPage() {
    const queryClient = useQueryClient();

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const response = await api.getJobs();
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });

    const handleDelete = (e: React.MouseEvent, jobId: string, jobName: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm(`Are you sure you want to delete "${jobName}"? This will also delete all associated RAMS documents.`)) {
            deleteMutation.mutate(jobId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading jobs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-50 rounded-md">
                Failed to load jobs. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Jobs</h1>
                    <p className="text-gray-600 mt-1">Manage your construction projects</p>
                </div>
                <Link href="/dashboard/jobs/new">
                    <Button>Create New Job</Button>
                </Link>
            </div>

            {jobs && jobs.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No jobs yet</CardTitle>
                        <CardDescription>
                            Create your first job to get started with RAMS generation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/jobs/new">
                            <Button>Create Your First Job</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {jobs?.map((job: any) => (
                        <Card key={job.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <Link href={`/dashboard/jobs/${job.id}`} className="flex-1">
                                        <div>
                                            <CardTitle>{job.projectName}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {job.clientName} {job.mainContractor && `• ${job.mainContractor}`}
                                            </CardDescription>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-gray-500">
                                            {job._count?.ramsDocuments || 0} RAMS
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={(e) => handleDelete(e, job.id, job.projectName)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <Link href={`/dashboard/jobs/${job.id}`}>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {job.siteAddress}, {job.sitePostcode}
                                        </div>
                                        {job.startDate && (
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(job.startDate).toLocaleDateString()}
                                                {job.endDate && ` - ${new Date(job.endDate).toLocaleDateString()}`}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                            Created by {job.createdBy?.firstName} {job.createdBy?.lastName}
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
