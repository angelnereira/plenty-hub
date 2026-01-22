'use client';

import React, { useState } from 'react';
import { ReceiptText, Search, Filter, MoreHorizontal, Download, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/features/billing/utils/financials';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './pdf/invoice-template';

export default function InvoiceListClient({ invoices }: any) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const filteredInvoices = invoices.filter((inv: any) =>
        inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/50">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar factura por número o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filtrar
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/30">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Número</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Total</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredInvoices.map((invoice: any) => (
                            <tr key={invoice.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2 tracking-tight">
                                        <ReceiptText className="h-4 w-4 text-slate-500" />
                                        {invoice.number}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-300 font-bold uppercase tracking-tight">{invoice.customerName}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500 font-medium">
                                        {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : 'Pendiente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={invoice.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-black text-white tabular-nums">{formatCurrency(invoice.total)}</span>
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === invoice.id ? null : invoice.id)}
                                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>

                                    {activeMenu === invoice.id && (
                                        <div className="absolute right-8 top-12 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all">
                                                <Eye className="h-4 w-4" />
                                                Ver Detalles
                                            </button>

                                            {/* Note: In a real app, you'd fetch the items here or provide a dedicated endpoint */}
                                            {/* For now, we show the action but PDF requires full data which we'd need to fetch */}
                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all">
                                                <Download className="h-4 w-4" />
                                                Descargar PDF
                                            </button>

                                            <div className="h-px bg-slate-800 my-2"></div>

                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Marcar como Pagada
                                            </button>

                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                                <Trash2 className="h-4 w-4" />
                                                Anular Factura
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        issued: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        draft: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        void: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    const labels: Record<string, string> = {
        issued: 'Emitida',
        paid: 'Pagada',
        draft: 'Borrador',
        void: 'Anulada',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-tighter ${styles[status] || styles.draft}`}>
            {labels[status] || status}
        </span>
    );
}
