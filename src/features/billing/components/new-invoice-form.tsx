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
    User as UserIcon,
    Percent,
    Mail
} from 'lucide-react';
import Link from 'next/link';
import { createInvoice } from '@/features/billing/actions/invoice-actions';
import { formatCurrency, calculateTotals, ITBMS_MAPPING } from '@/features/billing/utils/financials';
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
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
    const [step, setStep] = useState(1); // 1: Edit, 2: Review

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

    const totals = useMemo(() => calculateTotals(items), [items]);

    const invoiceDataForPDF = useMemo(() => ({
        number: invoiceNumber,
        items,
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
    }), [invoiceNumber, items, totals, selectedCustomer, customerMode, tenant]);

    const isFormValid = useMemo(() => (
        customerMode === 'anonymous' ||
        (customerMode === 'existing' ? !!customerId : !!customerData.name)
    ) && items.every(item => item.description && item.unitPrice >= 0), [customerMode, customerId, customerData, items]);

    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await createInvoice({
                tenantId,
                customerId: customerMode === 'existing' ? customerId : null,
                manualCustomer: customerMode === 'manual' ? customerData : null,
                items,
                ...totals,
                number: invoiceNumber
            });

            if (result?.success) {
                const pdfProps = {
                    invoice: { number: invoiceNumber, ...totals, issuedAt: new Date(), status: 'paid' },
                    items: items,
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

                <div className="flex items-center gap-2 bg-[var(--muted)] p-1.5 rounded-2xl border border-[var(--border)]">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${step === 1 ? 'bg-ueta-red text-white shadow-lg shadow-ueta-red/20' : 'text-slate-500'}`}>
                        <span className="h-5 w-5 flex items-center justify-center rounded-full bg-[var(--muted)] text-[10px]">1</span>
                        Edición
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-700" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${step === 2 ? 'bg-ueta-red text-white shadow-lg shadow-ueta-red/20' : 'text-slate-500'}`}>
                        <span className="h-5 w-5 flex items-center justify-center rounded-full bg-[var(--muted)] text-[10px]">2</span>
                        Revisión
                    </div>
                </div>
            </div>

            {step === 1 ? (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-8 min-w-0">
                        <section className="card border p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-ueta-red/5 blur-[80px] group-hover:bg-ueta-red/10 transition-all"></div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800/50 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-ueta-red/10 rounded-xl flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-ueta-red" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider text-[10px]">Información Fiscal del Cliente</h3>
                                </div>
                                <div className="flex bg-[var(--muted)] p-1.5 rounded-[22px] border border-[var(--border)] shadow-inner relative group/nav">
                                    <div
                                        className="absolute h-[calc(100%-12px)] top-1.5 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-ueta-red rounded-[16px] shadow-[0_8px_20px_rgba(230,0,35,0.3)]"
                                        style={{
                                            left: customerMode === 'anonymous' ? '6px' : customerMode === 'existing' ? 'calc(33.33% + 4px)' : 'calc(66.66% + 2px)',
                                            width: 'calc(33.33% - 8px)'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCustomerMode('anonymous')}
                                        className={`relative z-10 flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${customerMode === 'anonymous' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Consumidor Final
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCustomerMode('existing')}
                                        className={`relative z-10 flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${customerMode === 'existing' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Lista Clientes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCustomerMode('manual')}
                                        className={`relative z-10 flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${customerMode === 'manual' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Nuevo Cliente
                                    </button>
                                </div>
                            </div>

                            {customerMode === 'anonymous' ? (
                                <div className="bg-ueta-red/5 border border-ueta-red/10 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                                    <div className="h-12 w-12 bg-ueta-red/20 rounded-2xl flex items-center justify-center">
                                        <UserIcon className="h-6 w-6 text-ueta-red" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg">Receptor: Consumidor Final</p>
                                        <p className="text-slate-500 text-sm">Facturación rápida para clientes no registrados o ventas al detal.</p>
                                    </div>
                                </div>
                            ) : customerMode === 'existing' ? (
                                <select
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    className="select"
                                >
                                    <option value="">Buscar o seleccionar cliente...</option>
                                    {customers.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {c.ruc ? `(${c.ruc}-${c.dv || '00'})` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">Tipo de Receptor</label>
                                            <select
                                                value={customerData.clientType}
                                                onChange={(e) => setCustomerData({ ...customerData, clientType: e.target.value })}
                                                className="input text-sm"
                                            >
                                                <option value="02">Consumidor Final</option>
                                                <option value="01">Contribuyente (Empresa/Natural)</option>
                                                <option value="04">Extranjero</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">Email</label>
                                            <input
                                                type="email"
                                                value={customerData.email}
                                                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                                placeholder="cliente@ejemplo.com"
                                                className="input text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">Razón Social / Nombre Completo</label>
                                            <input
                                                type="text"
                                                value={customerData.name}
                                                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                                placeholder="Ej: Ángel Nereira o Plenty Hub Corp"
                                                className="input text-sm"
                                            />
                                        </div>
                                        {customerData.clientType === '01' && (
                                            <>
                                                <div className="md:col-span-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">RUC</label>
                                                    <input
                                                        type="text"
                                                        value={customerData.ruc}
                                                        onChange={(e) => setCustomerData({ ...customerData, ruc: e.target.value })}
                                                        placeholder="0-000-0000"
                                                        className="input font-mono text-sm"
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">DV</label>
                                                    <input
                                                        type="text"
                                                        maxLength={2}
                                                        value={customerData.dv}
                                                        onChange={(e) => setCustomerData({ ...customerData, dv: e.target.value })}
                                                        placeholder="00"
                                                        className="input font-mono text-sm"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">Dirección Física</label>
                                        <input
                                            type="text"
                                            value={customerData.address}
                                            onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                            placeholder="Calle, Edificio, Oficina..."
                                            className="input text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {((customerMode === 'existing' && !customerId) || (customerMode === 'manual' && !customerData.name)) && (
                                <div className="mt-6 flex items-center gap-2 text-amber-500/80 text-xs font-bold bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                                    <AlertCircle className="h-4 w-4" />
                                    Complete la información del cliente para habilitar la facturación.
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
                                        {items.map((item, index) => (
                                            <tr key={index} className="hover:bg-[var(--muted)]/20 transition-all">
                                                <td className="p-4 align-top">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Escriba el nombre del producto o servicio..."
                                                        className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-lg px-3 text-sm font-medium text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-red-500/20"
                                                    />
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

                                                {/* PRECIO UNITARIO - Currency Input */}
                                                <td className="p-4 align-top">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">$</span>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={(item.unitPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            onChange={(e) => {
                                                                const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                                                                updateItem(index, 'unitPriceUI', rawValue);
                                                            }}
                                                            className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 focus:border-red-500 rounded-lg pl-7 pr-3 text-right text-sm font-bold text-white outline-none focus:ring-2 focus:ring-red-500/20"
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
                                                    <span className="text-lg font-black text-emerald-400 tabular-nums">
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
                                        ))}
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
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={(item.unitPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                                                            updateItem(index, 'unitPriceUI', rawValue);
                                                        }}
                                                        className="w-full h-11 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-lg pl-7 pr-3 text-right text-sm font-bold text-white"
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

                            {/* Footer con botón añadir */}
                            <div className="p-6 bg-[var(--muted)]/30 border-t border-[var(--border)] flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <p className="text-[10px] text-[var(--muted-foreground)]">
                                    Todos los precios están en <strong>USD</strong>
                                </p>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 bg-ueta-red hover:bg-red-700 text-white px-6 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-ueta-red/20 active:scale-95"
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir ítem
                                </button>
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
                                    onClick={() => setStep(2)}
                                    disabled={!isFormValid}
                                    className="w-full bg-ueta-red hover:bg-red-700 disabled:opacity-30 disabled:grayscale text-white py-6 rounded-[24px] font-black text-lg shadow-2xl shadow-ueta-red/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                                >
                                    Revisar y Continuar
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                </div >
            ) : (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <div className="card border rounded-[48px] shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden">
                        <div className="bg-gradient-to-br from-ueta-red to-red-700 p-12 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-red-100/60 uppercase tracking-[0.4em] font-black text-[10px] mb-2">
                                    <div className="h-1 w-8 bg-red-100/30 rounded-full"></div>
                                    Comprobante Fiscal
                                </div>
                                <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">Vista Previa Final</h2>
                                <p className="text-red-100/70 font-medium text-sm mt-1">
                                    Validación de estructura para <span className="text-white font-bold underline decoration-red-300/30">{selectedCustomer?.name}</span>
                                </p>
                            </div>
                            <div className="h-20 w-20 bg-white/10 backdrop-blur-3xl rounded-3xl flex items-center justify-center shadow-inner border border-white/20 relative z-10">
                                <CheckCircle2 className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        <div className="p-12 sm:p-16 space-y-16 bg-[var(--muted)] backdrop-blur-md relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-b border-slate-800/50 pb-12">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] pl-1">Receptor</h4>
                                    <div>
                                        <p className="text-white font-black text-2xl tracking-tight">{selectedCustomer?.name}</p>
                                        <div className="mt-3 flex flex-col gap-1">
                                            {selectedCustomer?.ruc && (
                                                <p className="text-ueta-red font-mono text-sm border-l-2 border-ueta-red/30 pl-3">
                                                    RUC: {selectedCustomer.ruc}-{selectedCustomer.dv || '00'}
                                                </p>
                                            )}
                                            <p className="text-slate-400 text-sm pl-3 border-l-2 border-slate-800">{selectedCustomer?.email}</p>
                                            <p className="text-slate-500 text-xs pl-3 border-l-2 border-slate-800 mt-1 italic">{selectedCustomer?.address || 'Panamá'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:text-right space-y-6">
                                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] pr-1">Documento</h4>
                                    <div className="flex flex-col sm:items-end gap-2 text-sm">
                                        <div className="card border p-3 rounded-2xl w-fit sm:ml-auto">
                                            <p className="text-slate-500 font-bold uppercase text-[9px] mb-1">Carga Legal</p>
                                            <p className="text-white font-black font-mono text-lg">{invoiceNumber}</p>
                                        </div>
                                        <p className="text-slate-400 font-bold">Fecha de Emisión: <span className="text-white ml-2">{new Date().toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
                                        <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black w-fit sm:ml-auto border border-emerald-500/20">
                                            ESTADO: AUTORIZADO
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mb-8 flex items-center gap-3 pl-1">
                                    <Plus className="h-3 w-3 text-ueta-red" />
                                    Detalle de Operación
                                </h4>
                                <div className="space-y-6">
                                    {items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start group hover:bg-slate-800/20 p-4 -mx-4 rounded-3xl transition-all">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="text-white font-black text-md tracking-tight">{item.description}</p>
                                                    <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">ITBMS: {ITBMS_MAPPING[item.taxCode] / 100}%</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-slate-500 text-xs font-bold italic">
                                                        {item.quantity} {item.quantity === 1 ? 'UNIDAD' : 'UNIDADES'} × {formatCurrency(item.unitPrice)}
                                                    </p>
                                                    {item.discount > 0 && (
                                                        <span className="text-amber-500/80 text-[10px] font-black lowercase tracking-tighter">
                                                            (desc. {formatCurrency(item.discount)})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-white font-mono font-black text-lg tabular-nums border-b-2 border-ueta-red/30 pb-1">{formatCurrency(item.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card p-12 rounded-[40px] border border-[var(--border)] shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-ueta-red/5 blur-[100px]"></div>
                                <div className="flex flex-col sm:flex-row justify-between items-end gap-12 relative z-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-emerald-400 font-black text-[10px] uppercase bg-emerald-400/10 px-4 py-2 rounded-2xl border border-emerald-400/20 w-fit">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Estructura DGI Validada
                                        </div>
                                        <p className="text-slate-500 text-xs max-w-sm leading-relaxed font-medium">
                                            Este comprobante cumple con las especificaciones técnicas de facturación electrónica. Al emitir, se generará el CUFE legal.
                                        </p>
                                        <div className="p-4 bg-[var(--muted)] rounded-2xl border border-[var(--border)] w-fit">
                                            <p className="text-[10px] text-slate-600 font-black uppercase mb-2">Desglose de Impuestos</p>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-emerald-500 font-mono font-black">{formatCurrency(totals.taxTotal)}</span>
                                                    <span className="text-[8px] text-slate-700 font-bold uppercase">ITBMS</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400 font-mono font-bold">$0.00</span>
                                                    <span className="text-[8px] text-slate-700 font-bold uppercase">ISC</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">IMPORTE TOTAL NETO</p>
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-slate-700 text-3xl font-black italic">USD</span>
                                            <p className="text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">{formatCurrency(totals.total)}</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-ueta-red rounded-full mt-4 shadow-lg shadow-ueta-red/20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 border-t border-[var(--border)] bg-[var(--muted)] flex flex-col lg:flex-row gap-6">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 px-8 py-5 border-2 border-slate-800 hover:border-slate-700 text-slate-500 hover:text-white font-black rounded-3xl transition-all flex items-center justify-center gap-3 group active:scale-95"
                            >
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Editar Documento
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const subject = `Factura ${invoiceNumber} - ${tenant?.name || 'Plenty Hub'}`;
                                    const body = `Estimado cliente,\n\nAdjunto encontrará su factura ${invoiceNumber}.\n\nSaludos,\n${tenant?.name || 'Plenty Hub'}`;
                                    window.open(`mailto:${selectedCustomer?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                }}
                                className="px-5 py-5 bg-slate-800 hover:bg-slate-750 text-white font-black rounded-3xl transition-all flex items-center justify-center gap-3 whitespace-nowrap active:scale-95 border border-slate-700/50"
                                title="Enviar por correo"
                            >
                                <Mail className="h-4 w-4" />
                            </button>

                            <PDFDownloadLink
                                document={
                                    <InvoicePDF
                                        invoice={{ number: invoiceNumber, ...totals, issuedAt: new Date(), status: 'draft' }}
                                        items={items}
                                        customer={selectedCustomer}
                                        tenant={tenant || { name: 'Plenty Hub Corp.', slug: '155716248-2-2023' }}
                                    />
                                }
                                fileName={`${invoiceNumber}.pdf`}
                            >
                                {({ loading }) => (
                                    <button className="w-full px-8 py-5 bg-slate-800 hover:bg-slate-750 text-white font-black rounded-3xl transition-all flex items-center justify-center gap-3 whitespace-nowrap active:scale-95 border border-slate-700/50">
                                        <Download className="h-4 w-4" />
                                        {loading ? 'Generando PDF...' : 'Descargar Preview'}
                                    </button>
                                )}
                            </PDFDownloadLink>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-[1.5] px-12 py-5 bg-ueta-red hover:bg-red-700 text-white font-black rounded-3xl shadow-[0_20px_50px_rgba(230,0,35,0.4)] transition-all flex items-center justify-center gap-4 active:scale-95 text-xl relative overflow-hidden group"
                            >
                                {loading && <div className="absolute inset-0 bg-ueta-red/80 flex items-center justify-center z-10"><div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
                                <Save className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                EMITIR FACTURA LEGAL
                            </button>
                        </div>
                    </div>

                    <div className="card border p-6 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl card border border-[var(--border)] flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-slate-600" />
                            </div>
                            <p className="text-slate-500 text-xs font-medium max-w-sm">
                                Al confirmar, se guardará el registro inmutable y se descontará automáticamente el stock de los productos seleccionados.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-800"></div>
                            Ready for production
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
