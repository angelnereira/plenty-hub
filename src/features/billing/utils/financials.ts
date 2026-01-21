import Decimal from 'decimal.js';

export const ITBMS_MAPPING: Record<string, number> = {
    "00": 0,
    "01": 700,
    "02": 1000,
    "03": 1500
};

export interface LineItem {
    quantity: number;
    unitPrice: number; // in cents
    discount?: number; // per unit discount in cents
    taxCode: string;   // "00", "01", "02", "03"
}

export interface InvoiceTotals {
    subtotal: number;
    taxTotal: number;
    totalDiscount: number;
    total: number;
}

/**
 * Calculates invoice totals with high precision using decimal.js
 */
export function calculateTotals(items: LineItem[]): InvoiceTotals {
    let subtotal = new Decimal(0);
    let taxTotal = new Decimal(0);
    let totalDiscount = new Decimal(0);

    items.forEach(item => {
        const qty = new Decimal(item.quantity);
        const price = new Decimal(item.unitPrice);
        const disc = new Decimal(item.discount || 0);

        // Price per item after discount
        const discountedUnitPrice = price.minus(disc);
        const itemSubtotal = qty.times(discountedUnitPrice);
        const itemDiscountTotal = qty.times(disc);

        // Tax calculation based on code
        const rateBasis = ITBMS_MAPPING[item.taxCode] || 0;
        const rate = new Decimal(rateBasis).div(10000);
        const tax = itemSubtotal.times(rate);

        subtotal = subtotal.plus(itemSubtotal);
        taxTotal = taxTotal.plus(tax);
        totalDiscount = totalDiscount.plus(itemDiscountTotal);
    });

    return {
        subtotal: subtotal.round().toNumber(),
        taxTotal: taxTotal.round().toNumber(),
        totalDiscount: totalDiscount.round().toNumber(),
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
