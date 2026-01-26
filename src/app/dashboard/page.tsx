import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { StatsService } from '@/features/analytics/services/stats-service';
import { KPICard } from '@/features/analytics/components/kpi-card';
import { SalesChart } from '@/features/analytics/components/sales-chart';
import {
    Users,
    Package,
    DollarSign,
    User,
    Plus
} from 'lucide-react';
import { formatCurrency } from '@/features/billing/utils/financials';

export default async function DashboardPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.tenantId;
    const statsService = new StatsService();

    let kpis = { totalRevenue: 0, customerCount: 0, productCount: 0 };
    let salesTrend = [];
    let topCustomers: any[] = []; // Explicit any[] to avoid type issues with fallback

    try {
        [kpis, salesTrend, topCustomers] = await Promise.all([
            statsService.getDashboardKPIs(tenantId),
            statsService.getSalesTrend(tenantId),
            statsService.getTopCustomers(tenantId)
        ]) as [any, any, any]; // Robust casting
    } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        // Fallback values are already set
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 tracking-tight">Inicio</h1>
                    <p className="text-[var(--muted-foreground)]">Visualización de métricas clave para su empresa.</p>
                </div>
                <Link
                    href="/dashboard/invoices/new"
                    className="bg-ueta-red hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-ueta-red/20 transition-all active:scale-95 flex items-center gap-2 w-fit"
                >
                    <Plus className="h-4 w-4" /> Nueva Factura
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <KPICard
                    title="Ingresos Totales"
                    value={formatCurrency(kpis.totalRevenue)}
                    icon={DollarSign}
                    trend={{ value: 12, isUp: true }}
                />
                <KPICard
                    title="Clientes Activos"
                    value={kpis.customerCount}
                    icon={Users}
                />
                <KPICard
                    title="Productos"
                    value={kpis.productCount}
                    icon={Package}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Tendencia de Ventas</h2>
                        <div className="flex items-center gap-2 bg-[var(--muted)] p-1 rounded-lg border border-[var(--border)]">
                            <button className="px-3 py-1 text-xs font-bold bg-ueta-red text-white rounded-md">30D</button>
                            <button className="px-3 py-1 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">90D</button>
                        </div>
                    </div>
                    <SalesChart data={salesTrend as any} />
                </div>

                {/* Top Customers */}
                <div className="card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-6">Mejores Clientes</h2>
                    <div className="space-y-4">
                        {topCustomers.map((customer, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-[var(--muted)] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-[var(--muted)] rounded-xl flex items-center justify-center text-[var(--muted-foreground)] group-hover:bg-ueta-red/10 group-hover:text-ueta-red transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold group-hover:text-ueta-red transition-colors">{customer.name}</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">Local</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-ueta-red">{formatCurrency(customer.totalSpent)}</span>
                            </div>
                        ))}
                        {topCustomers.length === 0 && (
                            <p className="text-sm text-[var(--muted-foreground)] text-center py-10">Sin datos registrados.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
