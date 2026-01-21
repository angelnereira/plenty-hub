import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type CreateProductInput = typeof products.$inferInsert;

export class ProductService {
    async create(data: CreateProductInput) {
        const [product] = await db.insert(products).values(data).returning();
        return product;
    }

    async getAll(tenantId: string) {
        return db.query.products.findMany({
            where: eq(products.tenantId, tenantId)
        });
    }

    async getById(id: string) {
        return db.query.products.findFirst({
            where: eq(products.id, id)
        });
    }
}
