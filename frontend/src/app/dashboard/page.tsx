'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome back, {user?.firstName || 'User'}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Manage your projects and RAMS documents from here.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Job</CardTitle>
                        <CardDescription>
                            Start a new project with site details and scope of works
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/jobs/new">
                            <Button className="w-full">New Job</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>View All RAMS</CardTitle>
                        <CardDescription>
                            Browse and manage all your RAMS documents
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/rams">
                            <Button variant="outline" className="w-full">View RAMS</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Summary */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Jobs</CardDescription>
                        <CardTitle className="text-3xl">0</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">Active projects</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total RAMS</CardDescription>
                        <CardTitle className="text-3xl">0</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">Documents created</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Approved RAMS</CardDescription>
                        <CardTitle className="text-3xl">0</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">Ready for export</p>
                    </CardContent>
                </Card>
            </div>

            {/* Getting Started */}
            <Card>
                <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>
                        Follow these steps to create your first RAMS document
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                            1
                        </div>
                        <div>
                            <div className="font-medium">Create a Job</div>
                            <div className="text-sm text-gray-600">
                                Add project details, site address, and scope of works
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                            2
                        </div>
                        <div>
                            <div className="font-medium">Build Your RAMS</div>
                            <div className="text-sm text-gray-600">
                                Use our guided wizard to identify hazards and controls
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                            3
                        </div>
                        <div>
                            <div className="font-medium">Export & Share</div>
                            <div className="text-sm text-gray-600">
                                Download professional DOCX documents for your projects
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
