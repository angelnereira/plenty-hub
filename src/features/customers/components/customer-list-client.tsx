'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, Phone, MapPin, ExternalLink, MoreVertical, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '@/features/billing/utils/financials';
import CustomerFormModal from './customer-form-modal';
import { deleteCustomer } from '../actions/customer-actions';

export default function CustomerListClient({ customers, tenantId }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const handleEdit = (customer: any) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const handleAdd = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Está seguro de eliminar este cliente?')) {
            await deleteCustomer(id);
        }
        setActiveMenu(null);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Clientes</h1>
                    <p className="text-slate-500">Base de datos centralizada de sus clientes y partners.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                    <UserPlus className="h-4 w-4" />
                    Registrar Cliente
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {customers.map((customer: any) => (
                    <div key={customer.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 z-10">
                            <button
                                onClick={() => setActiveMenu(activeMenu === customer.id ? null : customer.id)}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-600 hover:text-white transition-colors"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </button>

                            {activeMenu === customer.id && (
                                <div className="absolute right-4 top-12 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => handleEdit(customer)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        Editar Datos
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Eliminar Cliente
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6 font-bold uppercase">
                                {customer.name[0]}
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors uppercase">{customer.name}</h3>
                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black tracking-tighter uppercase ${customer.type === 'B2B' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'}`}>
                                        {customer.type}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-mono tracking-tighter uppercase">{customer.ruc || 'Sin RUC'}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="text-xs truncate">{customer.email || 'No disponible'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Phone className="h-3.5 w-3.5" />
                                <span className="text-xs">{customer.phone || 'No disponible'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-xs truncate">{customer.address || 'Panamá'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">CLV Estimado</p>
                                <p className="text-sm font-bold text-white tracking-tight">{formatCurrency(customer.clv || 0)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Frecuencia</p>
                                <p className="text-sm font-bold text-emerald-500">{customer.frequency || 0} compras</p>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-blue-600/10 hover:text-blue-400 text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                            Ver Perfil Completo
                            <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {customers.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-900 border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4">
                        <UserPlus className="h-12 w-12 text-slate-700" />
                        <div className="text-center">
                            <p className="text-white font-bold">No hay clientes registrados</p>
                            <p className="text-slate-500 text-sm">Empiece a construir su base de datos hoy.</p>
                        </div>
                        <button onClick={handleAdd} className="mt-2 text-blue-500 hover:underline font-bold text-sm">Agregar Cliente</button>
                    </div>
                )}
            </div>

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customer={selectedCustomer}
                tenantId={tenantId}
            />
        </>
    );
}
