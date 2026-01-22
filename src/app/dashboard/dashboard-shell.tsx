'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Users,
    Package,
    LayoutDashboard,
    ReceiptText,
    Bell,
    Search as SearchIcon,
    LogOut,
    Settings,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    Pin,
    PinOff,
    Home
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { signOut } from 'next-auth/react'; // Client-side signout or pass action
// using server action passed as prop is better for composition, but simple signOut works too if standard

interface DashboardShellProps {
    children: React.ReactNode;
    session: any;
    tenant: any;
    signOutAction: () => Promise<void>;
}

export function DashboardShell({ children, session, tenant, signOutAction }: DashboardShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isPinned, setIsPinned] = useState(true); // Default to pinned for stability
    const [isHovered, setIsHovered] = useState(false);
    const pathname = usePathname();

    // Auto-collapse on mobile/tablet or strictly user preference? 
    // User asked for "auto hide when interacting with page".
    // Strategy:
    // If pinned: Sidebar stays w-64.
    // If NOT pinned: Sidebar is w-20 (icons). Expands to w-64 on hover.

    // Effective state calculation
    const isExpanded = isPinned || isHovered;

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {/* Desktop Sidebar */}
            <aside
                className={`
                    hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-lg sticky top-0 h-screen z-30
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? 'w-64' : 'w-20'}
                `}
                onMouseEnter={() => !isPinned && setIsHovered(true)}
                onMouseLeave={() => !isPinned && setIsHovered(false)}
            >
                {/* Header / Logo */}
                <div className={`flex items-center gap-3 mb-6 px-4 py-6 h-20 transition-all ${isExpanded ? 'justify-start' : 'justify-center'}`}>
                    {tenant?.logoUrl ? (
                        <div className="h-8 w-auto max-w-full overflow-hidden flex items-center justify-center">
                            <img src={tenant.logoUrl} alt="Logo" className="max-h-full object-contain" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 whitespace-nowrap overflow-hidden">
                            <div className="bg-ueta-red p-1.5 rounded-lg shadow-lg shadow-ueta-red/20 shrink-0">
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <span
                                className={`text-lg font-bold tracking-tight transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 w-0'}`}
                            >
                                Plenty <span className="text-ueta-red">Hub</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="space-y-2 flex-1 px-3">
                    {session.user.role === 'admin' && (
                        <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" isExpanded={isExpanded} active={pathname === '/dashboard'} />
                    )}
                    <SidebarLink href="/dashboard/invoices" icon={ReceiptText} label="Facturas" isExpanded={isExpanded} active={pathname.includes('/invoices')} />
                    {session.user.role !== 'billing' && (
                        <SidebarLink href="/dashboard/customers" icon={Users} label="Clientes" isExpanded={isExpanded} active={pathname.includes('/customers')} />
                    )}
                    {session.user.role === 'admin' && (
                        <SidebarLink href="/dashboard/inventory" icon={Package} label="Inventario" isExpanded={isExpanded} active={pathname.includes('/inventory')} />
                    )}
                    <SidebarLink href="/dashboard/settings" icon={Settings} label="Configuración" isExpanded={isExpanded} active={pathname.includes('/settings')} />
                </nav>

                {/* Footer Controls */}
                <div className="mt-auto p-3 space-y-2 border-t border-[var(--border)]">
                    {/* Pin Toggle */}
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        className={`
                            w-full flex items-center justify-center p-2 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-all
                            ${isExpanded ? 'gap-3' : ''}
                        `}
                        title={isPinned ? "Desanclar barra lateral" : "Anclar barra lateral"}
                    >
                        {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        {isExpanded && <span className="text-xs font-medium">Auto-ocultar</span>}
                    </button>

                    <ThemeToggle showLabel={isExpanded} />

                    <button
                        onClick={() => signOutAction()}
                        className={`
                            w-full flex items-center p-2.5 hover:bg-red-500/10 rounded-xl text-[var(--muted-foreground)] hover:text-red-500 transition-all
                            ${isExpanded ? 'gap-3 px-4' : 'justify-center px-2'}
                        `}
                        title="Cerrar Sesión"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span
                            className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}
                        >
                            Cerrar Sesión
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Header */}
                <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-4 md:px-8 glass sticky top-0 z-20">
                    <div className="flex items-center gap-4 bg-[var(--muted)] px-4 py-1.5 rounded-full border border-[var(--border)]">
                        <SearchIcon className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="bg-transparent border-none text-sm focus:ring-0 w-32 sm:w-40 outline-none placeholder:text-[var(--muted-foreground)]"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 bg-[var(--muted)] rounded-xl border border-[var(--border)] hover:bg-[var(--card)] text-[var(--muted-foreground)] transition-colors relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-ueta-red rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 ml-2 border-l border-[var(--border)] pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold leading-none">{session.user?.name}</p>
                                <p className="text-[10px] uppercase tracking-tighter mt-1 text-[var(--muted-foreground)]">{(session.user as any).role}</p>
                            </div>
                            <div className="h-9 w-9 bg-ueta-red rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-ueta-red/20">
                                {session.user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] shadow-lg z-50 pb-safe">
                <div className="flex items-center justify-around h-16">
                    {session.user.role === 'admin' && (
                        <MobileNavLink href="/dashboard" icon={Home} label="Inicio" />
                    )}
                    <MobileNavLink href="/dashboard/invoices" icon={ReceiptText} label="Facturas" />
                    {session.user.role !== 'billing' && (
                        <MobileNavLink href="/dashboard/customers" icon={Users} label="Clientes" />
                    )}
                    {session.user.role === 'admin' && (
                        <MobileNavLink href="/dashboard/inventory" icon={Package} label="Inventario" />
                    )}
                </div>
            </nav>
        </div>
    );
}

function SidebarLink({ href, icon: Icon, label, isExpanded, active }: any) {
    return (
        <Link
            href={href}
            className={`
                group flex items-center rounded-xl transition-all duration-200
                ${isExpanded ? 'gap-3 px-4 py-2.5' : 'justify-center p-2.5'}
                ${active ? 'bg-ueta-red/10 text-ueta-red' : 'text-[var(--muted-foreground)] hover:text-ueta-red hover:bg-ueta-red/5'}
            `}
            title={!isExpanded ? label : undefined}
        >
            <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${active ? 'text-ueta-red' : ''}`} />
            <span
                className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}
            >
                {label}
            </span>
        </Link>
    );
}

function MobileNavLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-1 p-2 text-[var(--muted-foreground)] hover:text-ueta-red transition-colors"
        >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
}
