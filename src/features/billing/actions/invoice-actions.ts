'use server';

import { db } from "@/lib/db";
import { invoices, invoiceItems, customers } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createInvoice(formData: any) {
    let {
        tenantId,
        customerId,
        manualCustomer,
        items,
        subtotal,
        taxTotal,
        totalDiscount,
        total,
        number
    } = formData;

    if (manualCustomer) {
        const [newCustomer] = await db.insert(customers).values({
            tenantId,
            name: manualCustomer.name,
            ruc: manualCustomer.ruc,
            dv: manualCustomer.dv,
            clientType: manualCustomer.clientType || '02',
            email: manualCustomer.email,
            address: manualCustomer.address,
            type: manualCustomer.type || 'B2C',
            clv: 0,
            avgTicket: 0,
            frequency: 0,
        }).returning();
        customerId = newCustomer.id;
    }

    const [invoice] = await db.insert(invoices).values({
        tenantId,
        customerId,
        number,
        status: 'issued',
        issuedAt: new Date(),
        subtotal,
        taxTotal,
        totalDiscount: totalDiscount || 0,
        total,
        currency: 'USD',
    }).returning();

    if (items && items.length > 0) {
        await db.insert(invoiceItems).values(
            items.map((item: any) => ({
                invoiceId: invoice.id,
                productId: item.productId || null,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                total: item.total,
                taxCode: item.taxCode || '01',
            }))
        );
    }

    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard');
    redirect('/dashboard/invoices');
}
