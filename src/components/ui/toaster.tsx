'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            toastOptions={{
                style: {
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                },
                classNames: {
                    toast: 'rounded-lg shadow-lg',
                    success: 'border-green-500/50',
                    error: 'border-red-500/50',
                    warning: 'border-yellow-500/50',
                    info: 'border-blue-500/50',
                },
            }}
        />
    );
}
