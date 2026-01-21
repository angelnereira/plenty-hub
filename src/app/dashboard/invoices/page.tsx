import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { invoices, customers } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import InvoiceListClient from '@/features/billing/components/invoice-list-client';

export default async function InvoicesPage() {
    const session = await auth();
    let tenantId = (session?.user as any)?.tenantId;

    // Resilience fallback
    if (!tenantId) {
        const firstTenant = await db.query.tenants.findFirst();
        tenantId = firstTenant?.id;
    }

    const invoiceList = tenantId ? await db
        .select({
            id: invoices.id,
            number: invoices.number,
            status: invoices.status,
            total: invoices.total,
            issuedAt: invoices.issuedAt,
            customerName: customers.name,
        })
        .from(invoices)
        .innerJoin(customers, eq(invoices.customerId, customers.id))
        .where(eq(invoices.tenantId, tenantId))
        .orderBy(desc(invoices.createdAt)) : [];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Facturas</h1>
                    <p className="text-slate-500">Gestione y emita facturas para sus clientes de forma masiva o individual.</p>
                </div>
                <Link
                    href="/dashboard/invoices/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Factura
                </Link>
            </div>

            <InvoiceListClient invoices={invoiceList} />
        </div>
    );
}
