'use server';

import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function upsertCustomer(data: any) {
    const { id, tenantId, name, type, ruc, email, phone, address } = data;

    if (id) {
        // Update
        await db.update(customers)
            .set({
                name,
                type,
                ruc,
                email,
                phone,
                address,
                updatedAt: new Date(),
            })
            .where(eq(customers.id, id));
    } else {
        // Create
        await db.insert(customers).values({
            tenantId,
            name,
            type: type || 'B2C',
            ruc,
            email,
            phone,
            address,
        });
    }

    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/invoices/new'); // In case they are issuing an invoice
}

export async function deleteCustomer(id: string) {
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath('/dashboard/customers');
}
