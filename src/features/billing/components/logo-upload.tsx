"use client";

import React, { useState } from 'react';
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { updateCompanyLogo } from '@/features/billing/actions/branding-actions';

interface LogoUploadProps {
    tenantId: string;
    initialLogoUrl?: string | null;
}

export function LogoUpload({ tenantId, initialLogoUrl }: LogoUploadProps) {
    const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatus('idle');

        try {
            // For now, we'll use a data URL as a placeholder or simulation
            // In a real app, you'd upload to S3/Cloudinary first
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const result = await updateCompanyLogo(tenantId, base64);
                if (result.success) {
                    setLogoUrl(base64);
                    setStatus('success');
                } else {
                    setStatus('error');
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setUploading(false);
            setStatus('error');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logo de la Empresa</span>
                {status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in zoom-in" />}
            </div>

            <div className="relative group">
                {logoUrl ? (
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 flex items-center justify-center">
                        <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                            <Upload className="h-6 w-6 text-white" />
                        </label>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center aspect-square w-full rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group/upload">
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                        {uploading ? (
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        ) : (
                            <>
                                <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center mb-3 group-hover/upload:scale-110 transition-transform">
                                    <ImageIcon className="h-6 w-6 text-slate-500 group-hover/upload:text-blue-500" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500">Subir Imagen</span>
                            </>
                        )}
                    </label>
                )}
            </div>

            <p className="text-[9px] text-slate-600 leading-relaxed italic">
                Recomendado: PNG con fondo transparente (máx 2MB). El logo se reflejará en todos tus documentos.
            </p>
        </div>
    );
}
