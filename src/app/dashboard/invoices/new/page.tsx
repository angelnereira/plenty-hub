import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customers, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import NewInvoiceForm from '@/features/billing/components/new-invoice-form';

export default async function NewInvoicePage() {
    const session = await auth();
    let tenantId = (session?.user as any)?.tenantId;

    // Resilience fallback
    if (!tenantId) {
        const firstTenant = await db.query.tenants.findFirst();
        tenantId = firstTenant?.id;
    }

    const [customerList, productList] = await Promise.all([
        db.select().from(customers).where(eq(customers.tenantId, tenantId)),
        db.select().from(products).where(eq(products.tenantId, tenantId))
    ]);

    return (
        <NewInvoiceForm
            customers={customerList}
            products={productList}
            tenantId={tenantId}
        />
    );
}
