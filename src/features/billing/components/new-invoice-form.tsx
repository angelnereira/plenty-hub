'use client';

import React, { useState, useMemo } from 'react';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    FileText,
    AlertCircle,
    CheckCircle2,
    User as UserIcon,
    Percent
} from 'lucide-react';
import Link from 'next/link';
import { createInvoice } from '@/features/billing/actions/invoice-actions';
import { formatCurrency, calculateTotals, ITBMS_MAPPING } from '@/features/billing/utils/financials';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/features/billing/components/pdf/invoice-template';
import { useRouter } from 'next/navigation';

export default function NewInvoiceForm({ customers, products, tenantId, tenant }: any) {
    const [customerMode, setCustomerMode] = useState('anonymous'); // existing | manual | anonymous
    const [customerData, setCustomerData] = useState({
        name: '',
        ruc: '',
        dv: '',
        email: '',
        address: '',
        type: 'B2C',
        clientType: '02' // 01=Contribuyente, 02=Consumidor Final, 04=Extranjero
    });
    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<any[]>([{
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxCode: '01',
        total: 0,
        productId: null
    }]);
    const [loading, setLoading] = useState(false);

    const selectedCustomer = useMemo(() => {
        if (customerMode === 'anonymous') return {
            name: 'Consumidor Final',
            ruc: '',
            dv: '',
            email: '',
            address: 'Panamá',
            clientType: '02',
            type: 'B2C'
        };
        if (customerMode === 'manual') return customerData;
        return customers.find((c: any) => c.id === customerId);
    }, [customerId, customers, customerMode, customerData]);

    const addItem = () => {
        setItems([...items, {
            description: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            taxCode: '01',
            total: 0,
            productId: null
        }]);
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
        } else if (field === 'unitPriceUI') {
            const priceInCents = Math.round((parseFloat(value) || 0) * 100);
            item.unitPrice = priceInCents;
        } else if (field === 'discountUI') {
            const discountInCents = Math.round((parseFloat(value) || 0) * 100);
            item.discount = discountInCents;
        } else if (field === 'unitPrice') {
            const price = Math.max(0, parseInt(value) || 0);
            item.unitPrice = price;
        } else {
            (item as any)[field] = value;
        }

        // Calculate line total for UI feedback
        item.total = item.quantity * Math.max(0, item.unitPrice - item.discount);

        newItems[index] = item;
        setItems(newItems);
    };

    const invoiceNumber = useMemo(() =>
        `INV-${Math.floor(Math.random() * 90000 + 10000)}`,
        []
    );

    // Helper functions para clasificar items
    const isItemEmpty = (item: any) => !item.description && item.unitPrice === 0;
    const isItemPartial = (item: any) => (item.description && item.unitPrice === 0) || (!item.description && item.unitPrice > 0);
    const isItemComplete = (item: any) => item.description && item.unitPrice > 0;

    // Items válidos para la factura (completos)
    const validItems = useMemo(() => items.filter(isItemComplete), [items]);

    // Items con datos parciales (necesitan atención)
    const partialItems = useMemo(() => items.filter(isItemPartial), [items]);

    const totals = useMemo(() => calculateTotals(validItems), [validItems]);

    const invoiceDataForPDF = useMemo(() => ({
        number: invoiceNumber,
        items: validItems,
        ...totals,
        customerName: selectedCustomer?.name,
        customerRuc: selectedCustomer?.ruc,
        customerDv: selectedCustomer?.dv,
        customerEmail: selectedCustomer?.email,
        customerAddress: selectedCustomer?.address,
        customerType: customerMode === 'anonymous' ? '02' : selectedCustomer?.clientType,
        logoUrl: tenant?.logoUrl,
        tenantName: tenant?.name || 'Plenty Hub Corp.',
        tenantRuc: "155716248-2-2023",
        tenantDv: "44",
        tenantAddress: "Pueblo Nuevo, Ciudad de Panamá",
        tenantEmail: "admin@plentyhub.com",
        tenantTel: "+507 833-0000"
    }), [invoiceNumber, validItems, totals, selectedCustomer, customerMode, tenant]);

    // Validación: cliente válido + al menos un item completo + sin items parciales
    const isFormValid = useMemo(() => {
        const customerValid = customerMode === 'anonymous' ||
            (customerMode === 'existing' ? !!customerId : !!customerData.name);
        const hasValidItems = validItems.length > 0;
        const noPartialItems = partialItems.length === 0;
        return customerValid && hasValidItems && noPartialItems;
    }, [customerMode, customerId, customerData, validItems, partialItems]);

    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await createInvoice({
                tenantId,
                customerId: customerMode === 'existing' ? customerId : null,
                manualCustomer: customerMode === 'manual' ? customerData : null,
                items: validItems,
                ...totals,
                number: invoiceNumber
            });

            if (result?.success) {
                const pdfProps = {
                    invoice: { number: invoiceNumber, ...totals, issuedAt: new Date(), status: 'paid' },
                    items: validItems,
                    customer: selectedCustomer,
                    tenant: tenant || { name: 'Plenty Hub Corp.', slug: '155716248-2-2023' }
                };
                const blob = await pdf(<InvoicePDF {...pdfProps} />).toBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${invoiceNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                router.push('/dashboard/invoices');
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="p-2.5 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all hover:scale-105 active:scale-95">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <FileText className="h-8 w-8 text-ueta-red" />
                            Nueva Factura
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 text-balance">Configure los detalles fiscales para emitir su comprobante profesional.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[var(--muted)] px-4 py-2 rounded-2xl border border-[var(--border)]">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID:</span>
                    <span className="text-sm font-mono font-bold text-white">{invoiceNumber}</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 w-full space-y-4 min-w-0">
                    {/* Sección Cliente - Compacta */}
                    <section className="card border p-4 rounded-2xl shadow-lg">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-ueta-red" />
                                Cliente
                            </span>
                            <div className="flex bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)]">
                                {[
                                    { mode: 'anonymous', label: 'Consumidor Final' },
                                    { mode: 'existing', label: 'Seleccionar' },
                                    { mode: 'manual', label: 'Nuevo' }
                                ].map((tab) => (
                                    <button
                                        key={tab.mode}
                                        type="button"
                                        onClick={() => setCustomerMode(tab.mode as any)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${customerMode === tab.mode
                                                ? 'bg-ueta-red text-white shadow-md'
                                                : 'text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            {/* Mostrar cliente seleccionado inline */}
                            {customerMode === 'anonymous' && (
                                <span className="text-sm text-white font-bold flex items-center gap-2 ml-auto">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    Receptor: Consumidor Final
                                </span>
                            )}
                            {customerMode === 'existing' && customerId && selectedCustomer && (
                                <span className="text-sm text-white font-bold flex items-center gap-2 ml-auto">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    {selectedCustomer.name}
                                    {selectedCustomer.ruc && <span className="text-slate-500 font-mono text-xs">({selectedCustomer.ruc})</span>}
                                </span>
                            )}
                        </div>

                        {/* Contenido según el modo */}
                        {customerMode === 'existing' && (
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="select text-sm h-10"
                            >
                                <option value="">Buscar o seleccionar cliente...</option>
                                {customers.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.ruc ? `(${c.ruc}-${c.dv || '00'})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}

                        {customerMode === 'manual' && (
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 animate-in fade-in duration-200">
                                <div className="col-span-2">
                                    <input
                                        type="text"
                                        value={customerData.name}
                                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                        placeholder="Nombre o Razón Social *"
                                        className="input text-sm h-10"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <select
                                        value={customerData.clientType}
                                        onChange={(e) => setCustomerData({ ...customerData, clientType: e.target.value })}
                                        className="input text-sm h-10 text-slate-400"
                                    >
                                        <option value="02">Consumidor Final</option>
                                        <option value="01">Contribuyente</option>
                                        <option value="04">Extranjero</option>
                                    </select>
                                </div>
                                {customerData.clientType === '01' && (
                                    <>
                                        <input
                                            type="text"
                                            value={customerData.ruc}
                                            onChange={(e) => setCustomerData({ ...customerData, ruc: e.target.value })}
                                            placeholder="RUC"
                                            className="input font-mono text-sm h-10"
                                        />
                                        <input
                                            type="text"
                                            maxLength={2}
                                            value={customerData.dv}
                                            onChange={(e) => setCustomerData({ ...customerData, dv: e.target.value })}
                                            placeholder="DV"
                                            className="input font-mono text-sm h-10 w-16"
                                        />
                                    </>
                                )}
                                <input
                                    type="email"
                                    value={customerData.email}
                                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                    placeholder="Email"
                                    className="input text-sm h-10"
                                />
                                <div className="col-span-2 md:col-span-6">
                                    <input
                                        type="text"
                                        value={customerData.address}
                                        onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                        placeholder="Dirección (opcional)"
                                        className="input text-sm h-10"
                                    />
                                </div>
                            </div>
                        )}

                        {((customerMode === 'existing' && !customerId) || (customerMode === 'manual' && !customerData.name)) && (
                            <div className="flex items-center gap-2 text-amber-500/80 text-xs font-bold mt-3">
                                <AlertCircle className="h-3 w-3" />
                                {customerMode === 'existing' ? 'Seleccione un cliente' : 'Ingrese el nombre del cliente'}
                            </div>
                        )}
                    </section>

                    <section className="card border border-[var(--border)] rounded-[24px] shadow-sm bg-[var(--card)] overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--border)]/50 bg-[var(--muted)]/20 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-ueta-red/10 rounded-xl flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-ueta-red" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider">Líneas de Detalle</h3>
                                    <p className="text-[10px] text-[var(--muted-foreground)] font-medium">Agregue los productos o servicios a facturar.</p>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-[var(--muted-foreground)] bg-[var(--muted)] px-3 py-1 rounded-full border border-[var(--border)]">
                                {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[var(--muted)]/30 border-b border-[var(--border)]">
                                        <th className="text-left p-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider" style={{ width: '40%' }}>
                                            Descripción / Producto
                                        </th>
                                        <th className="text-center p-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider" style={{ width: '12%' }}>
                                            Cantidad
                                        </th>
                                        <th className="text-right p-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider" style={{ width: '15%' }}>
                                            Precio Unit.
                                        </th>
                                        <th className="text-right p-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider" style={{ width: '15%' }}>
                                            Impuesto
                                        </th>
                                        <th className="text-right p-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider" style={{ width: '15%' }}>
                                            Total
                                        </th>
                                        <th className="p-4" style={{ width: '3%' }}></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]/50">
                                    {items.map((item, index) => {
                                        const isEmpty = isItemEmpty(item);
                                        const isPartial = isItemPartial(item);
                                        const isComplete = isItemComplete(item);
                                        return (
                                            <tr
                                                key={index}
                                                className={`transition-all ${isEmpty ? 'opacity-50 hover:opacity-80' :
                                                    isPartial ? 'bg-amber-500/5 border-l-2 border-l-amber-500' :
                                                        isComplete ? 'bg-emerald-500/5' : ''
                                                    } hover:bg-[var(--muted)]/20`}
                                            >
                                                <td className="p-4 align-top">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                            placeholder="Escriba el nombre del producto o servicio..."
                                                            className={`w-full h-10 bg-zinc-900 hover:bg-zinc-800 border rounded-lg px-3 text-sm font-medium text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-red-500/20 ${isPartial && !item.description ? 'border-amber-500 focus:border-amber-500' : 'border-zinc-700 focus:border-red-500'
                                                                }`}
                                                        />
                                                        {isEmpty && (
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600 font-bold uppercase">
                                                                Vacío
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* CANTIDAD - Number Stepper */}
                                                <td className="p-4 align-top">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                            className="h-10 w-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-l-lg text-white font-bold transition-all active:scale-95"
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 1;
                                                                updateItem(index, 'quantity', Math.max(1, val));
                                                            }}
                                                            className="h-10 w-14 bg-zinc-900 border-y border-zinc-700 text-center text-sm font-bold text-white outline-none focus:bg-zinc-800"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                                                            className="h-10 w-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-r-lg text-white font-bold transition-all active:scale-95"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* PRECIO UNITARIO - Simple Number Input */}
                                                <td className="p-4 align-top">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">$</span>
                                                        <input
                                                            type="number"
                                                            inputMode="decimal"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                            value={item.unitPrice === 0 ? '' : (item.unitPrice / 100)}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === '' || val === '0') {
                                                                    updateItem(index, 'unitPriceUI', '0');
                                                                } else {
                                                                    updateItem(index, 'unitPriceUI', val);
                                                                }
                                                            }}
                                                            className={`w-full h-10 bg-zinc-900 hover:bg-zinc-800 border rounded-lg pl-7 pr-3 text-right text-sm font-bold text-white outline-none focus:ring-2 focus:ring-red-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isPartial && item.unitPrice === 0 ? 'border-amber-500 focus:border-amber-500' : 'border-zinc-700 focus:border-red-500'
                                                                }`}
                                                        />
                                                    </div>
                                                </td>

                                                {/* IMPUESTO - Percentage Presets */}
                                                <td className="p-4 align-top">
                                                    <div className="flex items-center gap-1">
                                                        {[
                                                            { code: '00', label: '0%' },
                                                            { code: '01', label: '7%' },
                                                            { code: '02', label: '10%' },
                                                            { code: '03', label: '15%' },
                                                        ].map((tax) => (
                                                            <button
                                                                key={tax.code}
                                                                type="button"
                                                                onClick={() => updateItem(index, 'taxCode', tax.code)}
                                                                className={`h-10 px-2 rounded-lg text-xs font-bold transition-all ${item.taxCode === tax.code
                                                                    ? 'bg-red-500 text-white'
                                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                                                                    }`}
                                                            >
                                                                {tax.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* TOTAL */}
                                                <td className="p-4 align-top text-right">
                                                    <span className={`text-lg font-black tabular-nums ${isComplete ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                                        {formatCurrency(item.total)}
                                                    </span>
                                                </td>

                                                {/* ACCIONES */}
                                                <td className="p-4 align-top">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        disabled={items.length === 1}
                                                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Eliminar ítem"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden p-4 space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4">
                                    {/* Descripción */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Producto / Servicio</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            placeholder="Escriba el nombre del producto o servicio..."
                                            className="w-full h-11 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-lg px-3 text-sm text-white placeholder:text-zinc-500"
                                        />
                                    </div>

                                    {/* Grid de campos numéricos */}
                                    <div className="space-y-3">
                                        {/* Cantidad - Stepper */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Cantidad</label>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                    className="h-11 w-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-l-lg text-white font-bold text-lg"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 1;
                                                        updateItem(index, 'quantity', Math.max(1, val));
                                                    }}
                                                    className="h-11 flex-1 bg-zinc-900 border-y border-zinc-700 text-center text-sm font-bold text-white outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                                                    className="h-11 w-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-r-lg text-white font-bold text-lg"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Precio - Currency Input */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Precio Unit.</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={item.unitPrice === 0 ? '' : (item.unitPrice / 100)}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '' || val === '0') {
                                                            updateItem(index, 'unitPriceUI', '0');
                                                        } else {
                                                            updateItem(index, 'unitPriceUI', val);
                                                        }
                                                    }}
                                                    className="w-full h-11 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-lg pl-7 pr-3 text-right text-sm font-bold text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Impuesto - Presets */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Impuesto</label>
                                            <div className="flex items-center gap-1">
                                                {[
                                                    { code: '00', label: '0%' },
                                                    { code: '01', label: '7%' },
                                                    { code: '02', label: '10%' },
                                                    { code: '03', label: '15%' },
                                                ].map((tax) => (
                                                    <button
                                                        key={tax.code}
                                                        type="button"
                                                        onClick={() => updateItem(index, 'taxCode', tax.code)}
                                                        className={`h-11 flex-1 rounded-lg text-sm font-bold transition-all ${item.taxCode === tax.code
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                            }`}
                                                    >
                                                        {tax.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Total</label>
                                            <div className="h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-3 flex items-center justify-end">
                                                <span className="text-lg font-bold text-emerald-400">{formatCurrency(item.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Eliminar */}
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                        className="w-full h-10 border border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-30"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Eliminar ítem
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer con botón añadir y mensajes de estado */}
                        <div className="p-6 bg-[var(--muted)]/30 border-t border-[var(--border)] space-y-4">
                            {/* Mensajes de estado */}
                            {partialItems.length > 0 && (
                                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>
                                        {partialItems.length === 1
                                            ? 'Hay 1 item incompleto. Complete la descripción y el precio o elimínelo para continuar.'
                                            : `Hay ${partialItems.length} items incompletos. Complete descripción y precio o elimínelos.`
                                        }
                                    </span>
                                </div>
                            )}

                            {validItems.length === 0 && partialItems.length === 0 && (
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium bg-slate-500/5 p-3 rounded-xl border border-slate-500/10">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    Agregue al menos un producto con descripción y precio para generar la factura.
                                </div>
                            )}

                            {/* Resumen y botón */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <div className="flex items-center gap-4 text-[10px] text-[var(--muted-foreground)]">
                                    <span>Todos los precios están en <strong>USD</strong></span>
                                    {validItems.length > 0 && (
                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 font-bold">
                                            {validItems.length} {validItems.length === 1 ? 'item válido' : 'items válidos'}
                                        </span>
                                    )}
                                    {items.filter(isItemEmpty).length > 0 && (
                                        <span className="text-zinc-500 bg-zinc-500/10 px-2 py-1 rounded-full border border-zinc-700 font-bold">
                                            {items.filter(isItemEmpty).length} vacío{items.filter(isItemEmpty).length > 1 ? 's' : ''} (ignorado{items.filter(isItemEmpty).length > 1 ? 's' : ''})
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 bg-ueta-red hover:bg-red-700 text-white px-6 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-ueta-red/20 active:scale-95"
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir ítem
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="w-full lg:w-[400px] shrink-0 space-y-6 lg:sticky lg:top-8">
                    <div className="card border-2 border-[var(--border)] p-8 rounded-[40px] shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ueta-red via-emerald-500 to-ueta-red"></div>

                        <h3 className="text-xl font-black text-white mb-8 flex items-center justify-between pt-4">
                            Resumen Fiscal
                            <span className="text-[10px] text-slate-500 font-mono tracking-tighter">PREVIEW_MODE</span>
                        </h3>
                        <div className="space-y-5 mb-10">
                            <div className="flex justify-between items-center text-slate-500">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Subtotal Bruto</span>
                                <span className="text-sm font-bold text-slate-300 font-mono italic">
                                    {formatCurrency(totals.subtotal + totals.totalDiscount)}
                                </span>
                            </div>
                            {totals.totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-amber-500">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Descuento Total</span>
                                    <span className="text-sm font-mono font-bold italic">
                                        -{formatCurrency(totals.totalDiscount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-emerald-500">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Impuesto (ITBMS)</span>
                                <span className="text-lg font-mono font-black italic">
                                    {formatCurrency(totals.taxTotal)}
                                </span>
                            </div>
                            <div className="pt-8 border-t border-slate-800/50 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-ueta-red animate-pulse"></div>
                                    <span className="text-[10px] font-black text-ueta-red uppercase tracking-[0.3em]">Total a Emitir</span>
                                </div>
                                <div className="relative">
                                    <span className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_10px_15px_rgba(230,0,35,0.3)]">
                                        {formatCurrency(totals.total)}
                                    </span>
                                    <span className="absolute -right-8 bottom-2 text-xs font-bold text-slate-600 italic">USD</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!isFormValid || loading}
                                className="w-full bg-ueta-red hover:bg-red-700 disabled:opacity-30 disabled:grayscale text-white py-6 rounded-[24px] font-black text-lg shadow-2xl shadow-ueta-red/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                {loading && (
                                    <div className="absolute inset-0 bg-ueta-red/80 flex items-center justify-center z-10">
                                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <Save className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                {loading ? 'Procesando...' : 'Facturar'}
                            </button>
                            <div className="pt-4 flex items-center justify-center gap-4 border-t border-slate-800/50">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-6 w-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                            <div className="h-1 w-1 rounded-full bg-ueta-red"></div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[8px] text-slate-600 uppercase tracking-widest font-black leading-tight text-center">
                                    DGI PANAMA COMPLIANT 2026<br />
                                    SAFE-ID: {invoiceNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
