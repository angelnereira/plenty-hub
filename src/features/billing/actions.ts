'use server';

import { db } from '@/lib/db';
import { invoices, invoiceItems, products } from '@/lib/db/schema';
import { calculateTotals } from './utils/financials';
import { revalidatePath } from 'next/cache';

export async function createInvoice(data: any) {
    // data should involve customerId, tenantId, items: { productId, quantity, unitPrice }[]

    const { tenantId, customerId, items } = data;

    // 1. Calculate items with tax
    const lineItems = items.map((item: any) => ({
        ...item,
        taxRate: 700, // Hardcoded 7% for now, ideally fetched from product->tax
        total: item.quantity * item.unitPrice // Validation needed
    }));

    const totals = calculateTotals(lineItems);

    // 2. Create Invoice
    const [invoice] = await db.insert(invoices).values({
        tenantId,
        customerId,
        number: `INV-${Date.now()}`, // Simple sequence
        status: 'issued',
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        issuedAt: new Date(),
    }).returning();

    // 3. Create Items
    for (const item of lineItems) {
        await db.insert(invoiceItems).values({
            invoiceId: invoice.id,
            productId: item.productId,
            description: item.description || "Product",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total, // Recalculate ideally
            taxRate: item.taxRate
        });
        // Decrease stock
        // await db.update(products).set({ stock: sql`stock - ${item.quantity}` }).where(eq(products.id, item.productId));
    }

    revalidatePath('/invoices');
    return invoice;
}
