import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customers } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import CustomerListClient from '@/features/customers/components/customer-list-client';

export default async function CustomersPage() {
    const session = await auth();
    let tenantId = (session?.user as any)?.tenantId;

    // Resilience fallback
    if (!tenantId) {
        const firstTenant = await db.query.tenants.findFirst();
        tenantId = firstTenant?.id;
    }

    const customerList = tenantId ? await db
        .select()
        .from(customers)
        .where(eq(customers.tenantId, tenantId))
        .orderBy(desc(customers.createdAt)) : [];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <CustomerListClient customers={customerList} tenantId={tenantId} />
        </div>
    );
}
