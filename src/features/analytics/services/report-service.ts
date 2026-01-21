import { db } from "@/lib/db";
import { invoices, customers } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { formatCurrency } from "@/features/billing/utils/financials";

export class ReportService {
    /**
     * Generates a CSV string of sales data for a period
     */
    async generateSalesCSV(tenantId: string, startDate: Date, endDate: Date) {
        const records = await db
            .select({
                date: invoices.issuedAt,
                number: invoices.number,
                customer: customers.name,
                total: invoices.total,
                status: invoices.status,
            })
            .from(invoices)
            .innerJoin(customers, eq(invoices.customerId, customers.id))
            .where(
                and(
                    eq(invoices.tenantId, tenantId),
                    gte(invoices.issuedAt, startDate),
                    lte(invoices.issuedAt, endDate)
                )
            );

        const headers = ["Date", "Invoice #", "Customer", "Total", "Status"];
        const rows = records.map((r) => [
            r.date?.toLocaleDateString() || "",
            r.number,
            r.customer,
            formatCurrency(r.total),
            r.status,
        ]);

        return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }
}
