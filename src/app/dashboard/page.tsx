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
    User
} from 'lucide-react';
import { formatCurrency } from '@/features/billing/utils/financials';

export default async function DashboardPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.tenantId;
    const statsService = new StatsService();

    const [kpis, salesTrend, topCustomers] = await Promise.all([
        statsService.getDashboardKPIs(tenantId),
        statsService.getSalesTrend(tenantId),
        statsService.getTopCustomers(tenantId)
    ]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Inicio</h1>
                    <p className="text-slate-500">Visualización de métricas clave para su empresa.</p>
                </div>
                <Link
                    href="/dashboard/invoices/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                >
                    <span>+</span> Nueva Factura
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Tendencia de Ventas</h2>
                        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button className="px-3 py-1 text-xs font-bold text-white bg-slate-800 rounded-md">30D</button>
                            <button className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-white transition-colors">90D</button>
                        </div>
                    </div>
                    <SalesChart data={salesTrend as any} />
                </div>

                {/* Top Customers */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6">Mejores Clientes</h2>
                    <div className="space-y-6">
                        {topCustomers.map((customer, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{customer.name}</p>
                                        <p className="text-xs text-slate-500">Local</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-blue-400">{formatCurrency(customer.totalSpent)}</span>
                            </div>
                        ))}
                        {topCustomers.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-10">Sin datos registrados.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
