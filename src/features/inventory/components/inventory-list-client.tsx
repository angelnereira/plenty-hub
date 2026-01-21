'use client';

import React, { useState } from 'react';
import { Package, MoreVertical, Edit, Trash2, Tag, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/features/billing/utils/financials';
import ProductFormModal from './product-form-modal';
import { deleteProduct } from '../actions/product-actions';

export default function InventoryListClient({ products, stats, tenantId }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            await deleteProduct(id);
        }
        setActiveMenu(null);
    };

    const getStockStatus = (stock: number) => {
        if (stock <= 0) return { label: 'Agotado', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
        if (stock <= 5) return { label: 'Crítico', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
        return { label: 'Disponible', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Inventario</h1>
                    <p className="text-slate-500">Supervise sus productos, servicios y niveles de stock.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
                >
                    <Package className="h-5 w-5" />
                    Nuevo Producto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                        <Tag className="h-8 w-8 text-blue-500/20 group-hover:text-blue-500/40 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total SKU</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{stats.totalSku}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group text-amber-500">
                    <div className="absolute top-0 right-0 p-4">
                        <AlertTriangle className="h-8 w-8 text-amber-500/20 group-hover:text-amber-500/40 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stock Bajo</p>
                    <p className="text-3xl font-black tracking-tighter">{stats.lowStock}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                        <TrendingUp className="h-8 w-8 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor Inventario</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(stats.totalValue)}</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Producto / SKU</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Precio Venta</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Stock Actual</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Estado</th>
                                <th className="px-8 py-5 text-right border-b border-slate-800"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {products.map((product: any) => {
                                const status = getStockStatus(product.stock);
                                return (
                                    <tr key={product.id} className="group hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase">{product.name}</p>
                                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{product.sku || 'SIN SKU'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-white font-mono">{formatCurrency(product.price)}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Layers className="h-3.5 w-3.5 text-slate-600" />
                                                <span className="text-sm font-bold text-slate-300">{product.stock} und</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase border ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right relative">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)}
                                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-600 hover:text-white transition-all"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>

                                            {activeMenu === product.id && (
                                                <div className="absolute right-8 top-16 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                        Editar Producto
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Package className="h-16 w-16 text-slate-800" />
                        <div className="text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No hay existencias</p>
                            <button
                                onClick={handleAdd}
                                className="text-emerald-500 text-sm font-bold hover:underline mt-2"
                            >
                                Registrar primer producto
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                tenantId={tenantId}
            />
        </>
    );
}
