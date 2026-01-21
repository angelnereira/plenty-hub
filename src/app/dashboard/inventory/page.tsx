import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import InventoryListClient from '@/features/inventory/components/inventory-list-client';

export default async function InventoryPage() {
    const session = await auth();
    let tenantId = (session?.user as any)?.tenantId;

    // Resilience fallback
    if (!tenantId) {
        const firstTenant = await db.query.tenants.findFirst();
        tenantId = firstTenant?.id;
    }

    const productList = tenantId ? await db
        .select()
        .from(products)
        .where(eq(products.tenantId, tenantId))
        .orderBy(desc(products.createdAt)) : [];

    // Simple analytics
    const stats = {
        totalSku: productList.length,
        lowStock: productList.filter(p => p.stock > 0 && p.stock <= 5).length,
        totalValue: productList.reduce((acc, p) => acc + (p.price * p.stock), 0)
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <InventoryListClient
                products={productList}
                stats={stats}
                tenantId={tenantId}
            />
        </div>
    );
}
