import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Find an existing tenant to attach the user to
        const tenant = await db.query.tenants.findFirst();

        if (!tenant) {
            return NextResponse.json({ error: "No primary tenant found. Please create a tenant first." }, { status: 400 });
        }

        // Create the billing user
        // Note: Password is 'billing123' (plain text as per current system, but should be hashed in production)
        const newUser = await db.insert(users).values({
            tenantId: tenant.id,
            name: "Facturador Oficial",
            email: "facturacion@plentyhub.com",
            passwordHash: "billing123",
            role: "billing"
        }).returning();

        return NextResponse.json({
            success: true,
            message: "Billing user created successfully",
            credentials: {
                email: "facturacion@plentyhub.com",
                password: "billing123"
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
