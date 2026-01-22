'use client';

import { LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Credenciales inválidas. Por favor intente de nuevo.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ueta-red/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ueta-red/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                <div className="glass-card p-8 md:p-10 rounded-3xl shadow-2xl">
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="bg-ueta-red p-3 rounded-2xl mb-4 shadow-lg shadow-ueta-red/20"
                        >
                            <LayoutDashboard className="h-8 w-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold">
                            Plenty <span className="text-ueta-red">Hub</span>
                        </h1>
                        <p className="text-[var(--muted-foreground)] mt-2">Bienvenido de vuelta</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nombre@empresa.com"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Contraseña</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-ueta-red hover:bg-red-700 disabled:bg-ueta-red/50 text-white font-bold rounded-xl transition-all shadow-lg shadow-ueta-red/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                            {loading ? "Ingresando..." : "Ingresar"}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-[var(--border)] text-center">
                        <Link href="/" className="text-sm text-[var(--muted-foreground)] hover:text-ueta-red transition-colors">
                            ← Regresar al Inicio
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
