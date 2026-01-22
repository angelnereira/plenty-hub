import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, tenants } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function main() {
    console.log("Creating billing user...");

    // 1. Get or Create Tenant
    let tenant = await db.select().from(tenants).limit(1);
    let tenantId;

    if (tenant.length === 0) {
        console.log("No tenant found, creating one...");
        const newTenant = await db.insert(tenants).values({
            name: "Default Tenant",
            slug: "default-tenant",
        }).returning();
        tenantId = newTenant[0].id;
    } else {
        tenantId = tenant[0].id;
        console.log("Using existing tenant:", tenant[0].name);
    }

    // 2. Create User
    const email = "myt@importexport.com";
    // Check if user exists
    // querying by email to check existence
    // Note: schema import might be issue if it imports other things, but usually schema is pure.

    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length > 0) {
        console.log("User already exists, updating role...");
        await db.update(users).set({
            role: 'billing',
            passwordHash: 'password123',
            name: "M Y T IMport And Export"
        }).where(eq(users.email, email));
    } else {
        console.log("Creating new user...");
        await db.insert(users).values({
            email: email,
            name: "M Y T IMport And Export",
            passwordHash: 'password123',
            role: 'billing',
            tenantId: tenantId,
            isActive: true,
        });
    }

    console.log("User 'M Y T IMport And Export' created/updated.");
    console.log("Email: myt@importexport.com");
    console.log("Password: password123");

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
