'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        setIsOffline(!navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-orange-600 text-white p-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
            <WifiOff className="h-5 w-5" />
            <div className="flex-1">
                <p className="text-sm font-bold">Modo Offline</p>
                <p className="text-xs opacity-90">Los cambios se sincronizarán cuando vuelva el internet.</p>
            </div>
        </div>
    );
};
