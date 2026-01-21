'use server';

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function upsertProduct(data: any) {
    const { id, tenantId, name, sku, price, stock, description } = data;

    if (id) {
        // Update
        await db.update(products)
            .set({
                name,
                sku,
                price: Math.round(parseFloat(price) * 100), // Convert to cents
                stock: parseInt(stock),
                description,
                updatedAt: new Date(),
            })
            .where(eq(products.id, id));
    } else {
        // Create
        await db.insert(products).values({
            tenantId,
            name,
            sku,
            price: Math.round(parseFloat(price) * 100),
            stock: parseInt(stock),
            description,
        });
    }

    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard');
}

export async function deleteProduct(id: string) {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath('/dashboard/inventory');
}

export async function updateStock(id: string, newStock: number) {
    await db.update(products)
        .set({ stock: newStock, updatedAt: new Date() })
        .where(eq(products.id, id));
    revalidatePath('/dashboard/inventory');
}
