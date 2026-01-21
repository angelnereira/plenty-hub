import { db } from "@/lib/db";
import { customers, invoices, products } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";

export class SearchService {
    /**
     * Universal search across multiple entities
     */
    async universalSearch(tenantId: string, query: string) {
        const searchPattern = `%${query}%`;

        const foundCustomers = await db.query.customers.findMany({
            where: and(
                eq(customers.tenantId, tenantId),
                or(
                    ilike(customers.name, searchPattern),
                    ilike(customers.ruc || "", searchPattern),
                    ilike(customers.email || "", searchPattern)
                )
            ),
            limit: 5,
        });

        const foundInvoices = await db.query.invoices.findMany({
            where: and(eq(invoices.tenantId, tenantId), ilike(invoices.number, searchPattern)),
            limit: 5,
        });

        const foundProducts = await db.query.products.findMany({
            where: and(eq(products.tenantId, tenantId), ilike(products.name, searchPattern)),
            limit: 5,
        });

        return {
            customers: foundCustomers.map((c) => ({ id: c.id, title: c.name, type: "customer" })),
            invoices: foundInvoices.map((i) => ({ id: i.id, title: i.number, type: "invoice" })),
            products: foundProducts.map((p) => ({ id: p.id, title: p.name, type: "product" })),
        };
    }
}
