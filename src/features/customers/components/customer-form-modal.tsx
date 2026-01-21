'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Building2, Mail, Phone, MapPin, Hash } from 'lucide-react';
import { upsertCustomer } from '../actions/customer-actions';

export default function CustomerFormModal({ isOpen, onClose, customer, tenantId }: any) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'B2C',
        ruc: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                type: customer.type || 'B2C',
                ruc: customer.ruc || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || ''
            });
        } else {
            setFormData({
                name: '',
                type: 'B2C',
                ruc: '',
                email: '',
                phone: '',
                address: ''
            });
        }
    }, [customer, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await upsertCustomer({
                id: customer?.id,
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
                        <div className="h-12 w-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <UserIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <p className="text-slate-500 text-xs">Gestione la información comercial y de contacto.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-fit mb-6">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'B2C' })}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${formData.type === 'B2C' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <UserIcon className="h-4 w-4" />
                                    Consumidor Final
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'B2B' })}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${formData.type === 'B2B' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <Building2 className="h-4 w-4" />
                                    Empresa / B2B
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo o Razón Social</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserIcon className="h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium"
                                    placeholder="Ej: Ángel Nereira o Plenty Hub Corp"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">RUC / Cédula</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Hash className="h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.ruc}
                                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-mono"
                                    placeholder="0-000-0000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Teléfono</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                    placeholder="+507 0000-0000"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                    placeholder="ejemplo@email.com"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dirección Física</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                    placeholder="Calle principal, edificio..."
                                />
                            </div>
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
                            className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    {customer ? 'Actualizar Cliente' : 'Guardar Cliente'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
