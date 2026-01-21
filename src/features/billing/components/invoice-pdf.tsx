'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a clean font if needed, but standard ones work well for legal
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#1e293b',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6',
        paddingBottom: 20,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    invoiceTitle: {
        fontSize: 20,
        textAlign: 'right',
        color: '#3b82f6',
        fontWeight: 'bold',
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    infoBlock: {
        width: '45%',
    },
    label: {
        fontSize: 8,
        textTransform: 'uppercase',
        color: '#64748b',
        marginBottom: 4,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 10,
        fontWeight: 'medium',
    },
    table: {
        display: 'flex',
        width: 'auto',
        marginTop: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 10,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f8fafc',
        borderBottomWidth: 2,
        borderBottomColor: '#cbd5e1',
    },
    colDesc: { width: '50%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right', fontWeight: 'bold' },

    summarySection: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    summaryBlock: {
        width: '35%',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#3b82f6',
        marginTop: 8,
        paddingTop: 8,
    },
    totalText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10,
        color: '#94a3b8',
        fontSize: 8,
    }
});

export const InvoicePDF = ({ invoice }: any) => {
    const formatCurrency = (val: number) => `$${(val / 100).toFixed(2)}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.companyName}>Plenty Hub</Text>
                        <Text style={{ fontSize: 8, color: '#64748b' }}>Ciudad de Panamá, Panamá</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>FACTURA</Text>
                        <Text style={{ textAlign: 'right', fontSize: 10 }}>#{invoice.number}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Facturar a:</Text>
                        <Text style={[styles.value, { fontSize: 12, fontWeight: 'bold' }]}>{invoice.customerName}</Text>
                        {invoice.customerRuc && (
                            <Text style={[styles.value, { fontSize: 8, color: '#64748b', marginTop: 2 }]}>RUC: {invoice.customerRuc}</Text>
                        )}
                        <Text style={styles.value}>{invoice.customerEmail || ''}</Text>
                        <Text style={styles.value}>{invoice.customerAddress || ''}</Text>
                    </View>
                    <View style={[styles.infoBlock, { textAlign: 'right' }]}>
                        <Text style={styles.label}>Fecha de Emisión:</Text>
                        <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
                        <Text style={[styles.label, { marginTop: 10 }]}>Moneda:</Text>
                        <Text style={styles.value}>USD - Dólar Estadounidense</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.label, styles.colDesc]}>Descripción</Text>
                        <Text style={[styles.label, styles.colQty]}>Cant.</Text>
                        <Text style={[styles.label, styles.colPrice]}>Precio</Text>
                        <Text style={[styles.label, styles.colTotal]}>Total</Text>
                    </View>

                    {invoice.items.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.colDesc}>{item.description}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={styles.colTotal}>{formatCurrency(item.total)}</Text>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryBlock}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.label}>Subtotal:</Text>
                            <Text style={styles.value}>{formatCurrency(invoice.subtotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.label}>ITBMS (7%):</Text>
                            <Text style={styles.value}>{formatCurrency(invoice.taxTotal)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={[styles.label, { color: '#3b82f6' }]}>Total:</Text>
                            <Text style={styles.totalText}>{formatCurrency(invoice.total)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>Esta factura ha sido generada electrónicamente por Plenty Hub.</Text>
                    <Text>Gracias por su preferencia.</Text>
                </View>
            </Page>
        </Document>
    );
};
