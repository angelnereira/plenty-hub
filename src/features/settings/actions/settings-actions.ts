"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function updateTenantDetails(formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { success: false, error: "No autorizado" };
    }

    const name = formData.get("name") as string;
    const ruc = formData.get("ruc") as string;
    const dv = formData.get("dv") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const website = formData.get("website") as string;

    try {
        await db.update(tenants)
            .set({
                name,
                ruc,
                dv,
                email,
                phone,
                address,
                website,
                updatedAt: new Date(),
            })
            .where(eq(tenants.id, session.user.tenantId));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update tenant:", error);
        return { success: false, error: "Error al actualizar los datos" };
    }
}
