'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Mark that we're now on the client
        setIsClient(true);

        // Check authentication
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    // Always render children to avoid hydration mismatch
    // The useEffect will handle redirection if needed
    return <>{children}</>;
}
