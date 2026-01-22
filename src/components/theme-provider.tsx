'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/lib/stores/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme, mounted]);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="bg-[#1a1a1a] min-h-screen">
                {children}
            </div>
        );
    }

    return <>{children}</>;
}
