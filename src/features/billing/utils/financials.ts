import Decimal from 'decimal.js';

export interface LineItem {
    quantity: number;
    unitPrice: number;
    taxRate: number; // in basis points (e.g. 700 = 7%)
}

export interface InvoiceTotals {
    subtotal: number;
    taxTotal: number;
    total: number;
}

/**
 * Calculates invoice totals with high precision using decimal.js
 */
export function calculateTotals(items: LineItem[]): InvoiceTotals {
    let subtotal = new Decimal(0);
    let taxTotal = new Decimal(0);

    items.forEach(item => {
        const qty = new Decimal(item.quantity);
        const price = new Decimal(item.unitPrice);
        const itemTotal = qty.times(price);

        // Tax calculation per item for better precision matching line items in PDF
        const rate = new Decimal(item.taxRate).div(10000);
        const tax = itemTotal.times(rate);

        subtotal = subtotal.plus(itemTotal);
        taxTotal = taxTotal.plus(tax);
    });

    return {
        subtotal: subtotal.round().toNumber(), // Stored in cents, so we round to nearest integer
        taxTotal: taxTotal.round().toNumber(),
        total: subtotal.plus(taxTotal).round().toNumber()
    };
}

/**
 * Formats cents to currency string
 */
export function formatCurrency(amountInCents: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amountInCents / 100);
}
