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

    // Compliance Section
    complianceBox: {
        marginTop: 40,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    complianceTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#059669',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    complianceText: {
        fontSize: 9,
        color: '#065F46',
        lineHeight: 1.5,
        marginBottom: 3,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerText: {
        fontSize: 8,
        color: '#9CA3AF',
        lineHeight: 1.5,
        textAlign: 'center',
    },
    cufeText: {
        fontSize: 7,
        color: '#D1D5DB',
        marginTop: 8,
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
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                            {invoice.status === 'paid' ? 'PAGADO' : (invoice.status === 'draft' ? 'BORRADOR' : 'EMITIDA')}
                        </Text>
                    </View>
                    <View style={styles.checkIcon} />
                </View>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                {/* Info Section - Two Columns */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>RECEPTOR</Text>
                        <Text style={styles.customerName}>{customer.name}</Text>
                        <Text style={styles.infoText}>Tipo: {CLIENT_TYPE_MAP[customer.clientType || '02']}</Text>
                        {customer.ruc && (
                            <Text style={styles.infoTextBold}>
                                RUC: {customer.ruc}-{customer.dv || '00'}
                            </Text>
                        )}
                        {customer.email && <Text style={styles.infoText}>{customer.email}</Text>}
                        {customer.address && <Text style={styles.infoText}>{customer.address}</Text>}
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>DOCUMENTO</Text>
                        <View style={styles.highlightBox}>
                            <Text style={[styles.infoText, { color: '#9CA3AF', fontSize: 8, marginBottom: 4 }]}>CARGA LEGAL</Text>
                            <Text style={styles.invoiceNumber}>{invoice.number}</Text>
                        </View>
                        <Text style={[styles.infoTextBold, { marginTop: 12 }]}>
                            Fecha de Emisión: {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                        <Text style={styles.infoText}>Punto Fact.: 001</Text>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.tableSection}>
                    <Text style={styles.tableSectionTitle}>• DETALLE DE OPERACIÓN</Text>

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
                            <View style={styles.colDesc}>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                                {item.taxCode !== '00' && (
                                    <Text style={{ fontSize: 8, color: '#E60023' }}>
                                        ITBMS: {ITBMS_MAPPING[item.taxCode] / 100}%
                                    </Text>
                                )}
                            </View>
                            <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
                            <Text style={[styles.colPrice, styles.cellText]}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={[styles.colDisc, styles.cellText, { color: item.discount > 0 ? '#EF4444' : '#D1D5DB' }]}>
                                {item.discount > 0 ? formatCurrency(item.discount) : '-'}
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
                            <Text style={[styles.totalValue, { color: '#10B981' }]}>{formatCurrency(invoice.taxTotal)}</Text>
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

                {/* Compliance Section */}
                <View style={styles.complianceBox}>
                    <Text style={styles.complianceTitle}>✓ ESTRUCTURA DGI VALIDADA</Text>
                    <Text style={styles.complianceText}>
                        Este comprobante cumple con las especificaciones técnicas de facturación electrónica.
                    </Text>
                    <Text style={styles.complianceText}>
                        Al emitir, se generará el CUFE legal validado por la DGI de Panamá.
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Documento Tributario Generado a través del Sistema Plenty Hub v2.0
                </Text>
                <Text style={styles.footerText}>
                    Este documento es una representación gráfica de una factura electrónica validada por la DGI.
                </Text>
                <Text style={styles.cufeText}>
                    CUFE: {invoice.cufe || '000000000-0000-0000-0000-000000000000'}
                </Text>
            </View>
        </Page>
    </Document>
);
