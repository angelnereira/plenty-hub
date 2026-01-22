import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.tenantId) redirect('/login');

    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, session.user.tenantId),
    });

    if (!tenant) return null;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Configuración de Empresa</h1>
                <p className="text-slate-500 font-medium">Gestiona la identidad de tu marca y datos fiscales para facturación.</p>
            </div>

            <SettingsForm tenant={tenant} />
        </div>
    );
}
