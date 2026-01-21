"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateCompanyLogo(tenantId: string, logoUrl: string) {
    try {
        await db.update(tenants)
            .set({ logoUrl })
            .where(eq(tenants.id, tenantId));

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to update logo:", error);
        return { success: false, error: "No se pudo actualizar el logo" };
    }
}
