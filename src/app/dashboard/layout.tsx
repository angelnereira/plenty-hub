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
    Settings
} from 'lucide-react';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/login');

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 p-6 bg-slate-950 sticky top-0 h-screen">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">Plenty <span className="text-blue-500">Hub</span></span>
                </div>

                <nav className="space-y-1.5 flex-1">
                    <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarLink href="/dashboard/invoices" icon={ReceiptText} label="Facturas" />
                    <SidebarLink href="/dashboard/customers" icon={Users} label="Clientes" />
                    <SidebarLink href="/dashboard/inventory" icon={Package} label="Inventario" />
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <form action={async () => { "use server"; await signOut(); }}>
                        <button className="w-full px-4 py-2.5 hover:bg-red-500/10 rounded-xl flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all">
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-medium">Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-800/50">
                        <SearchIcon className="h-4 w-4 text-slate-500" />
                        <input type="text" placeholder="Buscar..." className="bg-transparent border-none text-sm focus:ring-0 w-40 outline-none placeholder:text-slate-600" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:bg-slate-800 text-slate-400 transition-colors relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 ml-2 border-l border-slate-800 pl-4 text-slate-400">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white leading-none">{session.user?.name}</p>
                                <p className="text-[10px] uppercase tracking-tighter mt-1 text-slate-500">{(session.user as any).role}</p>
                            </div>
                            <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-blue-500/20">
                                {session.user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all duration-200"
        >
            <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}
