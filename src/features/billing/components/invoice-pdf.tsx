'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#1e293b',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1.5,
        borderBottomColor: '#3b82f6',
        paddingBottom: 20,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    companySub: {
        fontSize: 7,
        color: '#64748b',
        marginTop: 2,
    },
    invoiceTitle: {
        fontSize: 18,
        textAlign: 'right',
        color: '#3b82f6',
        fontWeight: 'bold',
    },
    invoiceNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#1e293b',
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 8,
    },
    infoBlock: {
        width: '45%',
    },
    label: {
        fontSize: 7,
        textTransform: 'uppercase',
        color: '#64748b',
        marginBottom: 3,
        fontWeight: 'black',
    },
    value: {
        fontSize: 9,
        fontWeight: 'medium',
        color: '#1e293b',
    },
    table: {
        display: 'flex',
        width: 'auto',
        marginTop: 15,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 8,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f1f5f9',
        borderBottomWidth: 1.5,
        borderBottomColor: '#cbd5e1',
        paddingVertical: 6,
    },
    colDesc: { width: '40%' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colDisc: { width: '15%', textAlign: 'right' },
    colTax: { width: '5%', textAlign: 'center' },
    colTotal: { width: '15%', textAlign: 'right', fontWeight: 'bold' },

    summarySection: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    summaryBlock: {
        width: '35%',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#3b82f6',
        marginTop: 8,
        paddingTop: 8,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    totalText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 15,
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 7,
        lineHeight: 1.4,
    }
});

const CLIENT_TYPE_MAP: Record<string, string> = {
    '01': 'Contribuyente',
    '02': 'Consumidor Final',
    '04': 'Extranjero'
};

export const InvoicePDF = ({ invoice }: any) => {
    const formatCurrency = (val: number) => `$${(val / 100).toFixed(2)}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.companyName}>Plenty Hub Corp.</Text>
                        <Text style={styles.companySub}>RUC: 155716248-2-2023 DV: 44</Text>
                        <Text style={styles.companySub}>Pueblo Nuevo, Ciudad de Panamá</Text>
                        <Text style={styles.companySub}>Email: admin@plentyhub.com | Tel: +507 833-0000</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>FACTURA ELECTRÓNICA</Text>
                        <Text style={styles.invoiceNumber}>N° {invoice.number}</Text>
                        <Text style={[styles.companySub, { textAlign: 'right', color: '#3b82f6', fontWeight: 'bold' }]}>Punto de Facturación: 001</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Receptor / Cliente:</Text>
                        <Text style={[styles.value, { fontSize: 11, fontWeight: 'bold' }]}>{invoice.customerName}</Text>
                        {invoice.customerRuc && (
                            <Text style={[styles.value, { color: '#64748b', marginTop: 2 }]}>
                                RUC: {invoice.customerRuc} {invoice.customerDv ? `DV: ${invoice.customerDv}` : ''}
                            </Text>
                        )}
                        <Text style={[styles.value, { color: '#64748b' }]}>
                            Tipo: {CLIENT_TYPE_MAP[invoice.customerType] || 'Consumidor Final'}
                        </Text>
                        <Text style={[styles.value, { marginTop: 4 }]}>{invoice.customerAddress || ''}</Text>
                        <Text style={styles.value}>{invoice.customerEmail || ''}</Text>
                    </View>
                    <View style={[styles.infoBlock, { textAlign: 'right' }]}>
                        <Text style={styles.label}>Fecha de Emisión:</Text>
                        <Text style={styles.value}>{new Date().toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>

                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.label}>Método de Pago:</Text>
                            <Text style={styles.value}>Crédito 30 días</Text>
                        </View>

                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.label}>Moneda:</Text>
                            <Text style={styles.value}>USD - Dólar Estadounidense</Text>
                        </View>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.label, styles.colDesc]}>Descripción del Servicio / Producto</Text>
                        <Text style={[styles.label, styles.colQty]}>Cant.</Text>
                        <Text style={[styles.label, styles.colPrice]}>P. Unit</Text>
                        <Text style={[styles.label, styles.colDisc]}>Desc.</Text>
                        <Text style={[styles.label, styles.colTax]}>%</Text>
                        <Text style={[styles.label, styles.colTotal]}>Neto</Text>
                    </View>

                    {invoice.items.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.colDesc}>
                                <Text style={styles.value}>{item.description}</Text>
                            </View>
                            <Text style={[styles.value, styles.colQty]}>{item.quantity}</Text>
                            <Text style={[styles.value, styles.colPrice]}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={[styles.value, styles.colDisc, { color: '#ef4444' }]}>
                                {item.discount > 0 ? `(${formatCurrency(item.discount)})` : '-'}
                            </Text>
                            <Text style={[styles.value, styles.colTax]}>
                                {item.taxCode === '01' ? '7' : item.taxCode === '02' ? '10' : item.taxCode === '03' ? '15' : '0'}
                            </Text>
                            <Text style={[styles.value, styles.colTotal]}>{formatCurrency(item.total)}</Text>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryBlock}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.label}>Subtotal Bruto:</Text>
                            <Text style={styles.value}>{formatCurrency(invoice.subtotal + (invoice.totalDiscount || 0))}</Text>
                        </View>

                        {invoice.totalDiscount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={[styles.label, { color: '#ef4444' }]}>Descuento Total:</Text>
                                <Text style={[styles.value, { color: '#ef4444' }]}>-{formatCurrency(invoice.totalDiscount)}</Text>
                            </View>
                        )}

                        <View style={styles.summaryRow}>
                            <Text style={styles.label}>Impuesto (ITBMS):</Text>
                            <Text style={styles.value}>{formatCurrency(invoice.taxTotal)}</Text>
                        </View>

                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>TOTAL FACTURADO:</Text>
                            <Text style={styles.totalText}>{formatCurrency(invoice.total)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { fontWeight: 'bold', marginBottom: 5 }]}>
                        Documento Tributario Generado a través del Sistema Plenty Hub v2.0
                    </Text>
                    <Text style={styles.footerText}>
                        Este documento es una representación gráfica de una factura electrónica validada por la
                        Dirección General de Ingresos (DGI) de la República de Panamá.
                    </Text>
                    <Text style={[styles.footerText, { marginTop: 10, color: '#64748b' }]}>
                        CUFE: 000000000-0000-0000-0000-000000000000
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
