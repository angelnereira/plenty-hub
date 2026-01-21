'use client';

import React, { useState, useMemo } from 'react';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    FileText,
    Download,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import { createInvoice } from '@/features/billing/actions/invoice-actions';
import { formatCurrency, calculateTotals } from '@/features/billing/utils/financials';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './invoice-pdf';

export default function NewInvoiceForm({ customers, products, tenantId }: any) {
    const [customerMode, setCustomerMode] = useState('existing'); // existing | manual
    const [customerData, setCustomerData] = useState({ name: '', ruc: '', email: '', address: '', type: 'B2C' });
    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<any[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0, productId: null, taxRate: 700 }]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Edit, 2: Review

    const selectedCustomer = useMemo(() => {
        if (customerMode === 'manual') return customerData;
        return customers.find((c: any) => c.id === customerId);
    }, [customerId, customers, customerMode, customerData]);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0, productId: null, taxRate: 700 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        if (field === 'quantity') {
            const qty = Math.max(1, parseInt(value) || 0);
            item.quantity = qty;
            item.total = qty * item.unitPrice;
        } else if (field === 'unitPriceUI') {
            // value is in dollars from the input
            const priceInCents = Math.round((parseFloat(value) || 0) * 100);
            item.unitPrice = priceInCents;
            item.total = item.quantity * priceInCents;
        } else if (field === 'unitPrice') {
            // direct cent update (from product selection)
            const price = Math.max(0, parseInt(value) || 0);
            item.unitPrice = price;
            item.total = item.quantity * price;
        } else {
            (item as any)[field] = value;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const totals = useMemo(() => {
        return calculateTotals(items.map(i => ({
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxRate: i.taxRate || 700
        })));
    }, [items]);

    const invoiceNumber = useMemo(() =>
        `INV-${Math.floor(Math.random() * 90000 + 10000)}`,
        []
    );

    const isFormValid = (customerMode === 'existing' ? !!customerId : !!customerData.name) && items.every(item => item.description && item.unitPrice > 0);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createInvoice({
                tenantId,
                customerId: customerMode === 'existing' ? customerId : null,
                manualCustomer: customerMode === 'manual' ? customerData : null,
                items,
                ...totals,
                number: invoiceNumber
            });
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const invoiceDataForPDF = {
        number: invoiceNumber,
        customerName: selectedCustomer?.name || 'Cliente',
        customerRuc: selectedCustomer?.ruc,
        customerEmail: selectedCustomer?.email,
        customerAddress: selectedCustomer?.address,
        customerType: selectedCustomer?.type || 'B2C',
        items,
        ...totals
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header with Progress */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="p-2.5 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all hover:scale-105 active:scale-95">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-500" />
                            Nueva Factura
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Configure los detalles para emitir su comprobante legal.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${step === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500'}`}>
                        <span className="h-5 w-5 flex items-center justify-center rounded-full bg-slate-950/20 text-[10px]">1</span>
                        Edición
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-700" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${step === 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500'}`}>
                        <span className="h-5 w-5 flex items-center justify-center rounded-full bg-slate-950/20 text-[10px]">2</span>
                        Revisión
                    </div>
                </div>
            </div>

            {step === 1 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer Search/Select */}
                        <section className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] group-hover:bg-blue-600/10 transition-all"></div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800/50 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider text-xs">Información del Cliente</h3>
                                </div>
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                    <button
                                        onClick={() => setCustomerMode('existing')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${customerMode === 'existing' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                                    >
                                        Registrado
                                    </button>
                                    <button
                                        onClick={() => setCustomerMode('manual')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${customerMode === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                                    >
                                        Manual
                                    </button>
                                </div>
                            </div>

                            {customerMode === 'existing' ? (
                                <select
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600/50 transition-all appearance-none cursor-pointer text-lg font-medium"
                                >
                                    <option value="">Buscar o seleccionar cliente...</option>
                                    {customers.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Nombre o Empresa</label>
                                            <input
                                                type="text"
                                                value={customerData.name}
                                                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                                placeholder="Ej: Ángel Nereira o Plenty Hub Corp"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">RUC / Cédula</label>
                                            <input
                                                type="text"
                                                value={customerData.ruc}
                                                onChange={(e) => setCustomerData({ ...customerData, ruc: e.target.value })}
                                                placeholder="0-000-0000"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Tipo de Cliente</label>
                                            <select
                                                value={customerData.type}
                                                onChange={(e) => setCustomerData({ ...customerData, type: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="B2C">Consumidor Final (B2C)</option>
                                                <option value="B2B">Empresa (B2B)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {((customerMode === 'existing' && !customerId) || (customerMode === 'manual' && !customerData.name)) && (
                                <div className="mt-4 flex items-center gap-2 text-amber-500/80 text-xs font-bold bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                                    <AlertCircle className="h-4 w-4" />
                                    Complete la información del cliente para continuar.
                                </div>
                            )}
                        </section>

                        {/* Items Editor */}
                        <section className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider text-xs">Líneas de Factura</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir Línea
                                </button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-slate-950 rounded-2xl border border-slate-800/50 group/item hover:border-blue-500/30 transition-all">
                                        <div className="md:col-span-6 flex items-start gap-4">
                                            <div className="flex-1">
                                                <select
                                                    value={item.productId || ''}
                                                    onChange={(e) => {
                                                        const pId = e.target.value;
                                                        if (pId) {
                                                            const p = products.find((prod: any) => prod.id === pId);
                                                            if (p) {
                                                                const newItems = [...items];
                                                                newItems[index] = {
                                                                    ...newItems[index],
                                                                    productId: p.id,
                                                                    description: p.name,
                                                                    unitPrice: p.price, // Already in cents from DB
                                                                    total: p.price * newItems[index].quantity
                                                                };
                                                                setItems(newItems);
                                                            }
                                                        } else {
                                                            updateItem(index, 'productId', null);
                                                        }
                                                    }}
                                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-500 mb-2 outline-none focus:border-blue-500"
                                                >
                                                    <option value="">-- Seleccionar de Inventario --</option>
                                                    {products.map((p: any) => (
                                                        <option key={p.id} value={p.id}>{p.name} - ${p.price / 100}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Descripción del servicio o producto..."
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    className="w-full bg-transparent border-none text-white text-md focus:ring-0 placeholder:text-slate-700 font-medium p-0"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-2 bg-slate-900/50 rounded-xl px-3 group-focus-within/item:bg-slate-800 transition-colors">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase">Cant</span>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="w-full bg-transparent border-none text-white text-sm focus:ring-0 p-2 text-center"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-3">
                                            <div className="flex items-center gap-2 bg-slate-900/50 rounded-xl px-3 group-focus-within/item:bg-slate-800 transition-colors">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase">Precio</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.unitPrice / 100}
                                                    onChange={(e) => updateItem(index, 'unitPriceUI', e.target.value)}
                                                    className="w-full bg-transparent border-none text-white text-sm focus:ring-0 p-2 text-right font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-1 flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                disabled={items.length === 1}
                                                className="p-2 text-slate-700 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-lg disabled:opacity-0"
                                            >
                                                <Trash2 className="h-4.5 w-4.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[32px] shadow-2xl sticky top-24">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center justify-between">
                                Cálculo Final
                                <span className="text-[10px] text-slate-500 font-mono">#{invoiceNumber}</span>
                            </h3>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Subtotal Bruto</span>
                                    <span className="text-lg font-mono text-white">{formatCurrency(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Impuestos ITBMS (7%)</span>
                                    <span className="text-lg font-mono text-emerald-500">{formatCurrency(totals.taxTotal)}</span>
                                </div>
                                <div className="pt-8 border-t border-slate-800/50 flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Total a Pagar</span>
                                    <span className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_10px_10px_rgba(59,130,246,0.2)]">
                                        {formatCurrency(totals.total)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!isFormValid}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale text-white py-5 rounded-[20px] font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                                >
                                    Revisar y Continuar
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest font-black leading-relaxed">
                                    Plenty Hub Panama • Vía España<br />
                                    Transacción Bancaria Segura
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Review Mode UI */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="bg-blue-600 p-8 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-white leading-tight">Vista Previa de Factura</h2>
                                <p className="text-blue-100/70 text-sm">Resumen legal para el cliente {selectedCustomer?.name}</p>
                            </div>
                            <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        <div className="p-10 space-y-12 bg-slate-900 relative">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Emitido para</h4>
                                    <p className="text-white font-bold text-lg">{selectedCustomer?.name}</p>
                                    <p className="text-slate-400 text-sm mt-1">{selectedCustomer?.email}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{selectedCustomer?.address || 'Panamá'}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Detalle Legal</h4>
                                    <p className="text-white font-bold">Número: <span className="text-blue-400">{invoiceNumber}</span></p>
                                    <p className="text-slate-400 text-sm mt-1">Fecha: {new Date().toLocaleDateString()}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">Moneda: USD</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-6 border-b border-slate-800 pb-2">Artículos Facturados</h4>
                                <div className="space-y-4">
                                    {items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 group">
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-sm tracking-tight">{item.description}</p>
                                                <p className="text-slate-600 text-xs font-medium">Cant: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                            </div>
                                            <p className="text-white font-mono font-bold">{formatCurrency(item.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 flex justify-between items-end">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verificación Exitosa
                                    </div>
                                    <p className="text-slate-600 text-xs max-w-xs leading-relaxed">
                                        La emisión de esta factura actualizará automáticamente su inventario y reportes fiscales.
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Cancelado</p>
                                    <p className="text-4xl font-black text-blue-500 tabular-nums">{formatCurrency(totals.total)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 px-8 py-5 border-2 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold rounded-[20px] transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver a Editar
                            </button>

                            <PDFDownloadLink document={<InvoicePDF invoice={invoiceDataForPDF} />} fileName={`${invoiceNumber}.pdf`}>
                                {({ loading }) => (
                                    <button className="flex-1 px-8 py-5 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-[20px] transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                                        <Download className="h-4 w-4" />
                                        {loading ? 'Generando PDF...' : 'Descargar Recibo'}
                                    </button>
                                )}
                            </PDFDownloadLink>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[20px] shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Guardando...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Emitir y Guardar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ShieldCheck({ className }: any) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
}
