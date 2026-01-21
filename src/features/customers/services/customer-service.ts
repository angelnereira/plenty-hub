import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export type CreateCustomerInput = typeof customers.$inferInsert;

export class CustomerService {
    /**
     * Creates a new customer with duplicate detection
     */
    async create(data: CreateCustomerInput) {
        // Basic duplicate check by RUC or Email
        const existing = await db.query.customers.findFirst({
            where: or(
                data.ruc ? eq(customers.ruc, data.ruc) : undefined,
                data.email ? eq(customers.email, data.email) : undefined
            )
        });

        if (existing) {
            throw new Error("Customer with this RUC or Email already exists.");
        }

        // Levenshtein check for similar names (placeholder logic for now as Drizzle/Postgres implementation varies)
        // To do this efficiently, we'd use pg_trgm extension and a raw SQL query.
        // For now, we'll skip the fuzzy check in the basic service or do a simple LIKE check.

        const [customer] = await db.insert(customers).values(data).returning();
        return customer;
    }

    async getById(id: string) {
        return db.query.customers.findFirst({
            where: eq(customers.id, id)
        });
    }

    // search logic would go here
}
