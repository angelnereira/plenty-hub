import { renderToStream } from '@react-pdf/renderer';
import { InvoicePDF } from '@/features/billing/components/pdf/invoice-template';
import { db } from '@/lib/db';
import { invoices, customers, tenants, invoiceItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import React from 'react';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, id),
        with: {
            customer: true, // Need to setup relations in schema/relations.ts effectively or manual join
            // For simplicity in this plan, manual query or assuming relations exist.
            // Let's do manual queries for robustness in this draft.
        }
    });

    if (!invoice) return new NextResponse("Invoice not found", { status: 404 });

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    const customer = await db.query.customers.findFirst({ where: eq(customers.id, invoice.customerId) });
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, invoice.tenantId) });

    if (!customer || !tenant) return new NextResponse("Data error", { status: 500 });

    const stream = await renderToStream(
        // @ts-ignore - React PDF types sometimes conflict with newer React versions
        <InvoicePDF 
      invoice={ invoice } 
      items = { items } 
      customer = { customer } 
      tenant = { tenant }
        />
  );

    return new NextResponse(stream as unknown as ReadableStream, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
        },
    });
}
