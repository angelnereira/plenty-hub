import { db } from "@/lib/db";
import { invoices, customers, products } from "@/lib/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";

export class StatsService {
    /**
     * Get basic KPIs for the dashboard
     */
    private async ensureTenant(tenantId?: string) {
        if (tenantId) return tenantId;
        const firstTenant = await db.query.tenants.findFirst();
        return firstTenant?.id;
    }

    async getDashboardKPIs(tenantId?: string) {
        const tId = await this.ensureTenant(tenantId);
        if (!tId) return { totalRevenue: 0, customerCount: 0, productCount: 0 };

        const totalSalesRow = await db
            .select({ total: sql<number>`sum(${invoices.total})` })
            .from(invoices)
            .where(eq(invoices.tenantId, tId));

        const customerCountRow = await db
            .select({ count: sql<number>`count(*)` })
            .from(customers)
            .where(eq(customers.tenantId, tId));

        const productCountRow = await db
            .select({ count: sql<number>`count(*)` })
            .from(products)
            .where(eq(products.tenantId, tId));

        return {
            totalRevenue: totalSalesRow[0]?.total || 0,
            customerCount: customerCountRow[0]?.count || 0,
            productCount: productCountRow[0]?.count || 0,
        };
    }

    async getSalesTrend(tenantId?: string, days = 30) {
        const tId = await this.ensureTenant(tenantId);
        if (!tId) return [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const results = await db
            .select({
                date: sql<string>`DATE(${invoices.issuedAt})`,
                total: sql<number>`sum(${invoices.total})`,
            })
            .from(invoices)
            .where(and(eq(invoices.tenantId, tId), gte(invoices.issuedAt, startDate)))
            .groupBy(sql`DATE(${invoices.issuedAt})`)
            .orderBy(sql`DATE(${invoices.issuedAt})`);

        return results;
    }

    async getTopCustomers(tenantId?: string, limit = 5) {
        const tId = await this.ensureTenant(tenantId);
        if (!tId) return [];

        return db
            .select({
                name: customers.name,
                totalSpent: sql<number>`sum(${invoices.total})`,
            })
            .from(invoices)
            .innerJoin(customers, eq(invoices.customerId, customers.id))
            .where(eq(invoices.tenantId, tId))
            .groupBy(customers.name)
            .orderBy(sql`sum(${invoices.total}) desc`)
            .limit(limit);
    }
}
