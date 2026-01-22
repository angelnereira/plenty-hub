'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/lib/stores/theme-store';

export function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className={`
                w-full flex items-center rounded-xl transition-all
                ${showLabel ? 'gap-3 px-4 py-2.5 hover:bg-[var(--muted)]' : 'justify-center p-2.5 hover:bg-[var(--muted)]'}
                text-[var(--muted-foreground)] hover:text-[var(--foreground)]
            `}
            aria-label="Toggle theme"
            title={!showLabel ? (theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro') : undefined}
        >
            {theme === 'dark' ? (
                <>
                    <Sun className="h-4 w-4" />
                    <span
                        className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${showLabel ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}
                    >
                        Modo Claro
                    </span>
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                    <span
                        className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${showLabel ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}
                    >
                        Modo Oscuro
                    </span>
                </>
            )}
        </button>
    );
}
