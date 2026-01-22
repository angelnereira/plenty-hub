"use client";

import React, { useState } from 'react';
import { LogoUpload } from "@/features/billing/components/logo-upload";
import { updateTenantDetails } from "@/features/settings/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Building2, MapPin, Globe, Phone, Mail, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function SettingsForm({ tenant }: { tenant: any }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateTenantDetails(formData);
            if (result.success) {
                toast.success("Información de empresa actualizada");
                router.refresh();
            } else {
                toast.error(result.error || "Ocurrió un error");
            }
        } catch (error) {
            toast.error("Error al guardar cambios");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
            {/* Logo Section */}
            <div className="space-y-6">
                <div className="card p-6 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-sm">
                    <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-ueta-red" />
                        Identidad Visual
                    </h3>
                    <LogoUpload tenantId={tenant.id} initialLogoUrl={tenant.logoUrl} />
                    <p className="text-xs text-[var(--muted-foreground)] mt-4 leading-relaxed">
                        Este logo aparecerá en:
                        <br />• Encabezado del Dashboard
                        <br />• Facturas PDF
                        <br />• Correos a clientes
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="card p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-sm space-y-8">
                <div>
                    <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        Datos Fiscales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Razón Social / Nombre Comercial</Label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    name="name"
                                    defaultValue={tenant.name}
                                    className="w-full bg-[#1A1D24] hover:bg-[#252830] focus:bg-[#0F1115] text-white border border-gray-700/50 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-bold placeholder:text-gray-600"
                                    required
                                    placeholder="Ej. Mi Empresa S.A."
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <div className="space-y-2">
                                <Label>RUC / Cédula</Label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        name="ruc"
                                        defaultValue={tenant.ruc || ''}
                                        className="w-full bg-[#1A1D24] hover:bg-[#252830] focus:bg-[#0F1115] text-white border border-gray-700/50 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-mono font-medium placeholder:text-gray-600"
                                        placeholder="0000-0000-0000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>DV</Label>
                                <input
                                    name="dv"
                                    defaultValue={tenant.dv || ''}
                                    className="w-full bg-[#1A1D24] hover:bg-[#252830] focus:bg-[#0F1115] text-white border border-gray-700/50 focus:border-indigo-500 rounded-xl py-3 px-4 text-center outline-none transition-all font-mono font-medium placeholder:text-gray-600"
                                    placeholder="00"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-800/50"></div>

                <div>
                    <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        Contacto y Ubicación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Correo Electrónico</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={tenant.email || ''}
                                    className="w-full bg-[#1A1D24] hover:bg-[#252830] focus:bg-[#0F1115] text-white border border-gray-700/50 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="contacto@empresa.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    name="phone"
                                    defaultValue={tenant.phone || ''}
                                    className="w-full bg-[#1A1D24] hover:bg-[#252830] focus:bg-[#0F1115] text-white border border-gray-700/50 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="+507 6000-0000"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Dirección Física</Label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    name="address"
                                    defaultValue={tenant.address || ''}
                                    className="w-full bg-[#1A1D24] hover:bg-[#252830] focus:bg-[#0F1115] text-white border border-gray-700/50 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Ciudad, Calle, Edificio, Local..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Sitio Web</Label>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    name="website"
                                    defaultValue={tenant.website || ''}
                                    className="w-full bg-[#1A1D24] hover:bg-[#252830] focus:bg-[#0F1115] text-white border border-gray-700/50 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="https://www.miempresa.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">{children}</label>;
}

function ImageIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    )
}
