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
    Percent
} from 'lucide-react';
import Link from 'next/link';
import { createInvoice } from '@/features/billing/actions/invoice-actions';
import { formatCurrency, calculateTotals, ITBMS_MAPPING } from '@/features/billing/utils/financials';
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './invoice-pdf';
import { useRouter } from 'next/navigation';
import { LogoUpload } from './logo-upload';

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
                const blob = await pdf(<InvoicePDF invoice={invoiceDataForPDF} />).toBlob();
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
                            <FileText className="h-8 w-8 text-blue-500" />
                            Nueva Factura
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 text-balance">Configure los detalles fiscales para emitir su comprobante profesional.</p>
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
                        <section className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] group-hover:bg-blue-600/10 transition-all"></div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800/50 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider text-[10px]">Información Fiscal del Cliente</h3>
                                </div>
                                <div className="flex bg-slate-950 p-1.5 rounded-[22px] border border-slate-800/60 shadow-inner relative group/nav">
                                    <div
                                        className="absolute h-[calc(100%-12px)] top-1.5 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-blue-600 rounded-[16px] shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
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
                                <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                                    <div className="h-12 w-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                                        <UserIcon className="h-6 w-6 text-blue-500" />
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
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600/50 transition-all appearance-none cursor-pointer text-lg font-medium"
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
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
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
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
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
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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

                        <section className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-800/50 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-600/10 rounded-xl flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider text-[10px]">Líneas de Detalle</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir Ítem
                                </button>
                            </div>

                            {/* TABULAR HEADER */}
                            <div className="hidden md:grid grid-cols-[1fr_110px_70px_110px_110px_48px] gap-5 px-6 pb-4 border-b border-slate-800/30 mb-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-5">Ítem / Servicio</label>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Impuesto</label>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Cant.</label>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">P. Unitario</label>
                                <label className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest text-right pr-2">Descuento</label>
                                <span className="sr-only">Acciones</span>
                            </div>

                            <div className="space-y-4 overflow-x-auto pb-4">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_110px_70px_110px_110px_48px] gap-4 md:gap-5 p-4 md:p-4 bg-slate-950/40 rounded-[28px] border border-slate-800/40 group/item hover:border-blue-500/20 hover:bg-slate-900/40 transition-all duration-300 shadow-sm relative items-center">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600/0 group-hover/item:bg-blue-600/40 rounded-full transition-all"></div>

                                        {/* PRODUCT & DESCRIPTION */}
                                        <div className="space-y-2 pl-6 min-w-0">
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
                                                                unitPrice: p.price,
                                                                total: p.price * newItems[index].quantity
                                                            };
                                                            setItems(newItems);
                                                        }
                                                    } else {
                                                        updateItem(index, 'productId', null);
                                                    }
                                                }}
                                                className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all cursor-pointer h-10 shadow-inner truncate"
                                            >
                                                <option value="">-- Catálogo --</option>
                                                {products.map((p: any) => (
                                                    <option key={p.id} value={p.id}>{p.name} (${p.price / 100})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Descripción detallada..."
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                className="w-full bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-slate-800 font-bold p-0 tracking-tight leading-none h-6"
                                            />
                                        </div>

                                        {/* TAX */}
                                        <div className="min-w-0">
                                            <label className="text-[9px] font-black text-slate-700 uppercase md:hidden block mb-1">Impuesto</label>
                                            <select
                                                value={item.taxCode}
                                                onChange={(e) => updateItem(index, 'taxCode', e.target.value)}
                                                className="w-full h-10 bg-blue-600/5 border border-blue-600/20 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-widest text-blue-500 outline-none focus:border-blue-500/50 transition-all appearance-none text-center shadow-lg shadow-blue-500/5"
                                            >
                                                <option value="01">7%</option>
                                                <option value="02">10%</option>
                                                <option value="03">15%</option>
                                                <option value="00">0%</option>
                                            </select>
                                        </div>

                                        {/* QUANTITY */}
                                        <div className="min-w-0">
                                            <label className="text-[9px] font-black text-slate-700 uppercase md:hidden block mb-1">Cant.</label>
                                            <div className="flex items-center bg-slate-900/50 rounded-xl border border-slate-800/60 focus-within:border-blue-500/40 transition-all h-10 shadow-inner">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="w-full bg-transparent border-none text-white text-sm font-black focus:ring-0 py-0 text-center tabular-nums"
                                                />
                                            </div>
                                        </div>

                                        {/* UNIT PRICE */}
                                        <div className="min-w-0">
                                            <label className="text-[9px] font-black text-slate-700 uppercase md:hidden block mb-1">P. Unitario</label>
                                            <div className="flex items-center bg-slate-900/50 rounded-xl border border-slate-800/60 focus-within:border-blue-500/40 transition-all px-3 h-10 shadow-inner">
                                                <span className="text-slate-700 text-[11px] font-bold">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.unitPrice / 100}
                                                    onChange={(e) => updateItem(index, 'unitPriceUI', e.target.value)}
                                                    className="w-full bg-transparent border-none text-white text-sm font-black focus:ring-0 py-0 text-right tabular-nums"
                                                />
                                            </div>
                                        </div>

                                        {/* DISCOUNT */}
                                        <div className="min-w-0">
                                            <label className="text-[9px] font-black text-amber-700 uppercase md:hidden block mb-1">Dcto.</label>
                                            <div className="flex items-center bg-amber-500/5 rounded-xl border border-amber-500/10 focus-within:border-amber-500/30 transition-all px-3 h-10 shadow-lg shadow-amber-500/5">
                                                <span className="text-amber-500/40 text-[11px] font-bold">-$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.discount / 100}
                                                    onChange={(e) => updateItem(index, 'discountUI', e.target.value)}
                                                    className="w-full bg-transparent border-none text-amber-500 text-sm font-black focus:ring-0 py-0 text-right tabular-nums"
                                                />
                                            </div>
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                disabled={items.length === 1}
                                                className="p-2 text-slate-800 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl disabled:opacity-0 group-hover/item:opacity-100 opacity-0 md:opacity-100"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[40px] shadow-2xl sticky top-24 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>
                            <div className="mb-10 pb-8 border-b border-slate-800/50">
                                <LogoUpload tenantId={tenantId} initialLogoUrl={tenant?.logoUrl} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-8 flex items-center justify-between">
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
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Total a Emitir</span>
                                    </div>
                                    <div className="relative">
                                        <span className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_10px_15px_rgba(59,130,246,0.3)]">
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
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale text-white py-6 rounded-[24px] font-black text-lg shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                                >
                                    Revisar y Continuar
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="pt-4 flex items-center justify-center gap-4 border-t border-slate-800/50">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-6 w-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                                <div className="h-1 w-1 rounded-full bg-blue-500"></div>
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
            ) : (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <div className="bg-slate-900 border border-slate-800 rounded-[48px] shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-blue-100/60 uppercase tracking-[0.4em] font-black text-[10px] mb-2">
                                    <div className="h-1 w-8 bg-blue-100/30 rounded-full"></div>
                                    Comprobante Fiscal
                                </div>
                                <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">Vista Previa Final</h2>
                                <p className="text-blue-100/70 font-medium text-sm mt-1">
                                    Validación de estructura para <span className="text-white font-bold underline decoration-blue-300/30">{selectedCustomer?.name}</span>
                                </p>
                            </div>
                            <div className="h-20 w-20 bg-white/10 backdrop-blur-3xl rounded-3xl flex items-center justify-center shadow-inner border border-white/20 relative z-10">
                                <CheckCircle2 className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        <div className="p-12 sm:p-16 space-y-16 bg-slate-900/50 backdrop-blur-md relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-b border-slate-800/50 pb-12">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] pl-1">Receptor</h4>
                                    <div>
                                        <p className="text-white font-black text-2xl tracking-tight">{selectedCustomer?.name}</p>
                                        <div className="mt-3 flex flex-col gap-1">
                                            {selectedCustomer?.ruc && (
                                                <p className="text-blue-400 font-mono text-sm border-l-2 border-blue-500/30 pl-3">
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
                                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl w-fit sm:ml-auto">
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
                                    <Plus className="h-3 w-3 text-blue-500" />
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
                                            <p className="text-white font-mono font-black text-lg tabular-nums border-b-2 border-blue-500/30 pb-1">{formatCurrency(item.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950 p-12 rounded-[40px] border border-slate-800 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px]"></div>
                                <div className="flex flex-col sm:flex-row justify-between items-end gap-12 relative z-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-emerald-400 font-black text-[10px] uppercase bg-emerald-400/10 px-4 py-2 rounded-2xl border border-emerald-400/20 w-fit">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Estructura DGI Validada
                                        </div>
                                        <p className="text-slate-500 text-xs max-w-sm leading-relaxed font-medium">
                                            Este comprobante cumple con las especificaciones técnicas de facturación electrónica. Al emitir, se generará el CUFE legal.
                                        </p>
                                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 w-fit">
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
                                        <div className="h-1.5 w-full bg-blue-600 rounded-full mt-4 shadow-lg shadow-blue-600/20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 border-t border-slate-800 bg-slate-950/30 flex flex-col lg:flex-row gap-6">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 px-8 py-5 border-2 border-slate-800 hover:border-slate-700 text-slate-500 hover:text-white font-black rounded-3xl transition-all flex items-center justify-center gap-3 group active:scale-95"
                            >
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Editar Documento
                            </button>

                            <PDFDownloadLink document={<InvoicePDF invoice={invoiceDataForPDF} />} fileName={`${invoiceNumber}.pdf`}>
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
                                className="flex-[1.5] px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-4 active:scale-95 text-xl relative overflow-hidden group"
                            >
                                {loading && <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center z-10"><div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
                                <Save className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                EMITIR FACTURA LEGAL
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
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
            )}
        </div>
    );
}
