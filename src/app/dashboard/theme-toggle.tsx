'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/lib/stores/theme-store';

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className="w-full px-4 py-2.5 hover:bg-[var(--muted)] rounded-xl flex items-center gap-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <>
                    <Sun className="h-4 w-4" />
                    <span className="text-sm font-medium">Modo Claro</span>
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                    <span className="text-sm font-medium">Modo Oscuro</span>
                </>
            )}
        </button>
    );
}
