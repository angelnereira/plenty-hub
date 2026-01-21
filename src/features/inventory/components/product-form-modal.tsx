'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Package, Tag, DollarSign, Layers, Type } from 'lucide-react';
import { upsertProduct } from '../actions/product-actions';

export default function ProductFormModal({ isOpen, onClose, product, tenantId }: any) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        stock: '0',
        description: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                price: (product.price / 100).toString(),
                stock: product.stock.toString(),
                description: product.description || ''
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                price: '',
                stock: '0',
                description: ''
            });
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await upsertProduct({
                id: product?.id,
                tenantId,
                ...formData
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between p-8 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {product ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <p className="text-slate-500 text-xs">Gestione su catálogo e inventario físico.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Producto / Servicio</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Type className="h-4 w-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium"
                                    placeholder="Ej: Consultoría Legal o Laptop Pro 16"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Código SKU</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Tag className="h-4 w-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-mono"
                                    placeholder="ABC-123"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Precio Unitario ($)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <DollarSign className="h-4 w-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-bold"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Inicial</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Layers className="h-4 w-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    required
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all h-32 resize-none"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-750 text-slate-400 font-bold rounded-2xl transition-all active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    {product ? 'Actualizar Producto' : 'Guardar Producto'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
