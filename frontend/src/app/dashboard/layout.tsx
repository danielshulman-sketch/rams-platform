'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Jobs', href: '/dashboard/jobs' },
        { label: 'RAMS', href: '/dashboard/rams' },
        { label: 'Knowledge', href: '/dashboard/knowledge' },
        { label: 'Templates', href: '/dashboard/templates' },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Navigation */}
                <nav className="bg-white border-b">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo and Nav */}
                            <div className="flex items-center space-x-8">
                                <Link href="/dashboard" className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold">R</span>
                                    </div>
                                    <span className="text-lg font-semibold">RAMS Platform</span>
                                </Link>

                                <div className="hidden md:flex items-center space-x-1">
                                    {navItems.map((item) => (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant={pathname === item.href ? 'secondary' : 'ghost'}
                                                size="sm"
                                            >
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* User Menu */}
                            <div className="flex items-center space-x-4">
                                {mounted && user && (
                                    <div className="hidden md:block text-sm">
                                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                                        <div className="text-gray-500 text-xs">{user.organization?.name}</div>
                                    </div>
                                )}
                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
