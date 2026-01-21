import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency } from '../../utils/financials';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
        paddingTop: 5,
    },
    cell: {
        flex: 1,
        fontSize: 10,
    },
    totalSection: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
});

interface InvoiceProps {
    invoice: any; // Ideally typed with schema
    items: any[];
    customer: any;
    tenant: any;
}

export const InvoicePDF = ({ invoice, items, customer, tenant }: InvoiceProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{tenant.name}</Text>
                    <Text style={{ fontSize: 10 }}>RUC: {tenant.slug}</Text>
                </View>
                <View>
                    <Text style={styles.title}>INVOICE</Text>
                    <Text style={{ fontSize: 12 }}>#{invoice.number}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Bill To:</Text>
                <Text style={{ fontSize: 10 }}>{customer.name}</Text>
                <Text style={{ fontSize: 10 }}>RUC: {customer.ruc}</Text>
            </View>

            <View style={{ marginTop: 20 }}>
                <View style={[styles.row, { borderBottomWidth: 2 }]}>
                    <Text style={[styles.cell, { flex: 3 }]}>Description</Text>
                    <Text style={styles.cell}>Qty</Text>
                    <Text style={styles.cell}>Price</Text>
                    <Text style={styles.cell}>Total</Text>
                </View>
                {items.map((item, i) => (
                    <View key={i} style={styles.row}>
                        <Text style={[styles.cell, { flex: 3 }]}>{item.description}</Text>
                        <Text style={styles.cell}>{item.quantity}</Text>
                        <Text style={styles.cell}>{formatCurrency(item.unitPrice)}</Text>
                        <Text style={styles.cell}>{formatCurrency(item.total)}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.totalSection}>
                <Text style={{ fontSize: 10 }}>Subtotal: {formatCurrency(invoice.subtotal)}</Text>
                <Text style={{ fontSize: 10 }}>Tax: {formatCurrency(invoice.taxTotal)}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 5 }}>
                    Total: {formatCurrency(invoice.total)}
                </Text>
            </View>
        </Page>
    </Document>
);
