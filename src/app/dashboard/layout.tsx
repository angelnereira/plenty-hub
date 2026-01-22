import React from 'react';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    Package,
    LayoutDashboard,
    ReceiptText,
    Bell,
    Search as SearchIcon,
    LogOut,
    Sun,
    Moon,
    Home,
    Settings
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/login');

    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, session.user.tenantId),
    });

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r border-[var(--border)] p-6 bg-[var(--card)]/80 backdrop-blur-lg sticky top-0 h-screen">
                <div className="flex items-center gap-2 mb-10 px-2">
                    {tenant?.logoUrl ? (
                        <div className="h-10 w-auto max-w-full overflow-hidden flex items-center">
                            <img src={tenant.logoUrl} alt="Logo" className="max-h-full object-contain" />
                        </div>
                    ) : (
                        <>
                            <div className="bg-ueta-red p-1.5 rounded-lg shadow-lg shadow-ueta-red/20">
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">Plenty <span className="text-ueta-red">Hub</span></span>
                        </>
                    )}
                </div>

                <nav className="space-y-1.5 flex-1">
                    {session.user.role === 'admin' && (
                        <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    )}
                    <SidebarLink href="/dashboard/invoices" icon={ReceiptText} label="Facturas" />
                    {session.user.role !== 'billing' && (
                        <SidebarLink href="/dashboard/customers" icon={Users} label="Clientes" />
                    )}
                    {session.user.role === 'admin' && (
                        <SidebarLink href="/dashboard/inventory" icon={Package} label="Inventario" />
                    )}
                    <SidebarLink href="/dashboard/settings" icon={Settings} label="Configuración" />
                </nav>

                <div className="mt-auto pt-6 border-t border-[var(--border)] space-y-2">
                    <ThemeToggle />
                    <form action={async () => { "use server"; await signOut(); }}>
                        <button className="w-full px-4 py-2.5 hover:bg-red-500/10 rounded-xl flex items-center gap-3 text-[var(--muted-foreground)] hover:text-red-500 transition-all">
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-medium">Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
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

function SidebarLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-ueta-red hover:bg-ueta-red/5 transition-all duration-200"
        >
            <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium">{label}</span>
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
