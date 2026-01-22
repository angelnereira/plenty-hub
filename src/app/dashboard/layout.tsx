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
import { DashboardShell } from './dashboard-shell';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.tenantId) redirect('/login');

    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, session.user.tenantId),
    });

    const signOutAction = async () => {
        "use server";
        await signOut();
    };

    return (
        <DashboardShell session={session} tenant={tenant} signOutAction={signOutAction}>
            {children}
        </DashboardShell>
    );
}
