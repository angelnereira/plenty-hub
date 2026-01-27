import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { formatCurrency } from '../../utils/financials';

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },

    // Red Header Section
    redHeader: {
        backgroundColor: '#E60023',
        padding: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 2,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    statusText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    checkIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },

    // Content Area
    contentArea: {
        padding: 40,
    },

    // Info Sections (two columns)
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    infoBox: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 9,
        color: '#9CA3AF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 3,
        lineHeight: 1.4,
    },
    infoTextBold: {
        fontSize: 10,
        color: '#374151',
        fontWeight: 'bold',
        marginBottom: 3,
    },
    highlightBox: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#E60023',
    },
    invoiceNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        letterSpacing: 0.5,
    },

    // Table Section
    tableSection: {
        marginBottom: 30,
    },
    tableSectionTitle: {
        fontSize: 9,
        color: '#E60023',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },

    // Table Columns
    colDesc: { flex: 3 },
    colQty: { flex: 0.6, textAlign: 'center' },
    colPrice: { flex: 1.2, textAlign: 'right' },
    colDisc: { flex: 1, textAlign: 'right' },
    colTax: { flex: 0.7, textAlign: 'center' },
    colTotal: { flex: 1.3, textAlign: 'right' },

    headerText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    cellText: {
        fontSize: 10,
        color: '#374151',
    },
    cellTextBold: {
        fontSize: 10,
        color: '#111827',
        fontWeight: 'bold',
    },
    itemDescription: {
        fontSize: 11,
        color: '#111827',
        fontWeight: 'bold',
        marginBottom: 2,
    },

    // Totals Section
    totalsSection: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalsBox: {
        width: 280,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    totalLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 11,
        color: '#374151',
        fontWeight: 'bold',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        marginTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#E60023',
    },
    grandTotalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    grandTotalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E60023',
        letterSpacing: 0.5,
    },

    footer: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerText: {
        fontSize: 7,
        color: '#9CA3AF',
        lineHeight: 1.2,
        textAlign: 'center',
    },
    cufeText: {
        fontSize: 6,
        color: '#D1D5DB',
        marginTop: 4,
        textAlign: 'center',
        fontFamily: 'Courier',
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
            {/* Red Header */}
            <View style={styles.redHeader}>
                <View style={styles.headerLeft}>
                    {tenant.logoUrl ? (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image
                            src={tenant.logoUrl}
                            style={{ height: 50, marginBottom: 10, objectFit: 'contain' }}
                        />
                    ) : (
                        <Text style={styles.headerTitle}>{tenant.name || 'PLENTY HUB'}</Text>
                    )}
                    <Text style={styles.headerSubtitle}>{tenant.name}</Text>
                    <Text style={styles.headerSubtitle}>RUC: {tenant.ruc || tenant.slug}</Text>
                    {tenant.dv && <Text style={styles.headerSubtitle}>DV: {tenant.dv}</Text>}
                    <Text style={styles.headerSubtitle}>Email: {tenant.email || 'admin@plentyhub.com'}</Text>
                    <Text style={styles.headerSubtitle}>{tenant.address || 'Panamá, Rep. de Panamá'}</Text>
                </View>
                <View style={styles.headerRight}>
                    {/* Removed Badge as requested */}
                    <Text style={[styles.headerTitle, { fontSize: 24 }]}>FACTURA</Text>
                    <Text style={styles.headerSubtitle}>N° {invoice.number}</Text>
                </View>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                {/* Info Section - Two Columns */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>CLIENTE / RECEPTOR</Text>
                        <Text style={styles.customerName}>{customer.name}</Text>
                        <Text style={styles.infoText}>RUC: {customer.ruc || 'N/A'}-{customer.dv || ''}</Text>
                        <Text style={styles.infoText}>Dirección: {customer.address || 'No registrada'}</Text>
                        <Text style={styles.infoText}>Tel: {customer.phone || 'N/A'}</Text>
                        <Text style={styles.infoText}>Email: {customer.email || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>DATOS DE LA FACTURA</Text>
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.infoTextBold}>Fecha de Emisión:</Text>
                            <Text style={styles.infoText}>
                                {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.infoTextBold}>Condiciones de Pago:</Text>
                            <Text style={styles.infoText}>{invoice.paymentTerms || 'Contado'}</Text>
                        </View>
                        {invoice.dueDate && (
                            <View style={{ marginTop: 8 }}>
                                <Text style={styles.infoTextBold}>Vencimiento:</Text>
                                <Text style={styles.infoText}>
                                    {new Date(invoice.dueDate).toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.tableSection}>
                    <Text style={styles.tableSectionTitle}>DETALLE DE PRODUCTOS / SERVICIOS</Text>

                    <View style={styles.tableHeader}>
                        <Text style={[styles.colDesc, styles.headerText]}>DESCRIPCIÓN</Text>
                        <Text style={[styles.colQty, styles.headerText]}>CANT</Text>
                        <Text style={[styles.colPrice, styles.headerText]}>PRECIO</Text>
                        <Text style={[styles.colTax, styles.headerText]}>IMP.</Text>
                        <Text style={[styles.colTotal, styles.headerText]}>TOTAL</Text>
                    </View>

                    {items.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.colDesc}>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                            <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
                            <Text style={[styles.colPrice, styles.cellText]}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={[styles.colTax, styles.cellText]}>
                                {ITBMS_MAPPING[item.taxCode] ? (ITBMS_MAPPING[item.taxCode] / 100) + '%' : 'Exento'}
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
                            <Text style={[styles.totalValue, { color: '#111827' }]}>{formatCurrency(invoice.taxTotal)}</Text>
                        </View>
                        {invoice.totalDiscount > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Descuento</Text>
                                <Text style={[styles.totalValue, { color: '#EF4444' }]}>-{formatCurrency(invoice.totalDiscount)}</Text>
                            </View>
                        )}
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>TOTAL A PAGAR</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
                        </View>
                    </View>
                </View>

                {/* Signature / Approval Section */}
                <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 150, borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 5 }} />
                        <Text style={{ fontSize: 8, color: '#374151', fontWeight: 'bold' }}>RECIBIDO CONFORME</Text>
                        <Text style={{ fontSize: 7, color: '#6B7280' }}>Firma y Cédula</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 150, borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 5 }} />
                        <Text style={{ fontSize: 8, color: '#374151', fontWeight: 'bold' }}>AUTORIZADO POR</Text>
                        <Text style={{ fontSize: 7, color: '#6B7280' }}>{tenant.name}</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.cufeText}>
                    CUFE: {invoice.cufe || '000000000-0000-0000-0000-000000000000'}
                </Text>
                <Text style={[styles.footerText, { marginTop: 4 }]}>
                    Generado por Plenty Hub v2.0
                </Text>
            </View>
        </Page>
    </Document>
);
