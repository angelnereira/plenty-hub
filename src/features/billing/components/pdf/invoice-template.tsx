import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { formatCurrency } from '../../utils/financials';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
        color: '#334155',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 20,
    },
    brandSection: {
        flexDirection: 'column',
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    brandSubtitle: {
        fontSize: 10,
        color: '#64748B',
    },
    invoiceDetails: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
        marginBottom: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#475569',
        textTransform: 'uppercase',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    detailLabel: {
        fontSize: 10,
        color: '#64748B',
        width: 80, // Increased for wider labels
        textAlign: 'right',
        marginRight: 8,
    },
    detailValue: {
        fontSize: 10,
        color: '#0F172A',
        fontWeight: 'bold',
    },
    billToSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 4,
        width: '100%',
    },
    customerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 2,
    },
    customerInfo: {
        fontSize: 10,
        color: '#475569',
        marginBottom: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    colDesc: { flex: 3 },
    colQty: { flex: 0.5, textAlign: 'center' },
    colPrice: { flex: 1, textAlign: 'right' },
    colDisc: { flex: 0.8, textAlign: 'right' },
    colTax: { flex: 0.5, textAlign: 'center' },
    colTotal: { flex: 1, textAlign: 'right' },

    headerText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#475569',
        textTransform: 'uppercase',
    },
    cellText: {
        fontSize: 10,
        color: '#334155',
    },
    cellTextBold: {
        fontSize: 10,
        color: '#0F172A',
        fontWeight: 'bold',
    },

    totalsSection: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalsBox: {
        width: 220,
        padding: 10,
        backgroundColor: '#F8FAFC',
        borderRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    totalLabel: {
        fontSize: 10,
        color: '#64748B',
    },
    totalValue: {
        fontSize: 10,
        color: '#0F172A',
        fontWeight: 'bold',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    grandTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    grandTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    footerIndex: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    footerText: {
        fontSize: 8,
        color: '#94A3B8',
        lineHeight: 1.5,
    }
});

const CLIENT_TYPE_MAP: Record<string, string> = {
    '01': 'Contribuyente',
    '02': 'Consumidor Final',
    '04': 'Extranjero'
};

const ITBMS_MAPPING: Record<string, number> = {
    "00": 0,
    "01": 700,
    "02": 1000,
    "03": 1500
};

interface InvoiceProps {
    invoice: any;
    items: any[];
    customer: any;
    tenant: any;
}

export const InvoicePDF = ({ invoice, items, customer, tenant }: InvoiceProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View style={styles.brandSection}>
                    <Text style={styles.brandTitle}>{tenant.name || 'Plenty Hub Corp.'}</Text>
                    <Text style={styles.brandSubtitle}>RUC: {tenant.ruc || tenant.slug}</Text>
                    {tenant.dv && <Text style={styles.brandSubtitle}>DV: {tenant.dv}</Text>}
                    <Text style={styles.brandSubtitle}>Email: {tenant.email || 'admin@plentyhub.com'}</Text>
                </View>
                <View style={styles.invoiceDetails}>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{invoice.status === 'paid' ? 'PAGADO' : (invoice.status === 'draft' ? 'BORRADOR' : 'PENDIENTE')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>FACTURA #</Text>
                        <Text style={styles.detailValue}>{invoice.number}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>FECHA</Text>
                        <Text style={styles.detailValue}>
                            {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>PUNTO FACT.</Text>
                        <Text style={[styles.detailValue, { color: '#3b82f6' }]}>001</Text>
                    </View>
                </View>
            </View>

            {/* Client Info */}
            <View style={styles.billToSection}>
                <Text style={styles.sectionTitle}>FACTURAR A</Text>
                <Text style={styles.customerName}>{customer.name}</Text>
                {customer.ruc && <Text style={styles.customerInfo}>RUC: {customer.ruc} {customer.dv ? `DV: ${customer.dv}` : ''}</Text>}
                <Text style={styles.customerInfo}>Tipo: {CLIENT_TYPE_MAP[customer.clientType || '02'] || 'Consumidor Final'}</Text>
                {customer.email && <Text style={styles.customerInfo}>{customer.email}</Text>}
                {customer.address && <Text style={styles.customerInfo}>{customer.address}</Text>}
                {customer.phone && <Text style={styles.customerInfo}>{customer.phone}</Text>}
            </View>

            {/* Items Table */}
            <View>
                <View style={styles.tableHeader}>
                    <Text style={[styles.colDesc, styles.headerText]}>DESCRIPCIÓN</Text>
                    <Text style={[styles.colQty, styles.headerText]}>CANT</Text>
                    <Text style={[styles.colPrice, styles.headerText]}>P. UNIT</Text>
                    <Text style={[styles.colDisc, styles.headerText]}>DESC.</Text>
                    <Text style={[styles.colTax, styles.headerText]}>%</Text>
                    <Text style={[styles.colTotal, styles.headerText]}>TOTAL</Text>
                </View>
                {items.map((item, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={[styles.colDesc, styles.cellText]}>{item.description}</Text>
                        <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
                        <Text style={[styles.colPrice, styles.cellText]}>{formatCurrency(item.unitPrice)}</Text>
                        <Text style={[styles.colDisc, styles.cellText, { color: '#ef4444' }]}>
                            {item.discount > 0 ? `(${formatCurrency(item.discount)})` : '-'}
                        </Text>
                        <Text style={[styles.colTax, styles.cellText]}>
                            {ITBMS_MAPPING[item.taxCode] ? (ITBMS_MAPPING[item.taxCode] / 100) + '%' : '0%'}
                        </Text>
                        <Text style={[styles.colTotal, styles.cellTextBold]}>{formatCurrency(item.total)}</Text>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsSection}>
                <View style={styles.totalsBox}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Impuestos (ITBMS)</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.taxTotal)}</Text>
                    </View>
                    {invoice.totalDiscount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Descuento</Text>
                            <Text style={[styles.totalValue, { color: '#EF4444' }]}>-{formatCurrency(invoice.totalDiscount)}</Text>
                        </View>
                    )}
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>TOTAL</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footerIndex}>
                <Text style={[styles.footerText, { fontWeight: 'bold', marginBottom: 5 }]}>
                    Documento Tributario Generado a través del Sistema Plenty Hub v2.0
                </Text>
                <Text style={styles.footerText}>
                    Este documento es una representación gráfica de una factura electrónica validada por la
                    Dirección General de Ingresos (DGI) de la República de Panamá.
                </Text>
                <Text style={[styles.footerText, { marginTop: 10, color: '#64748b' }]}>
                    CUFE: {invoice.cufe || '000000000-0000-0000-0000-000000000000'}
                </Text>
            </View>
        </Page>
    </Document>
);
