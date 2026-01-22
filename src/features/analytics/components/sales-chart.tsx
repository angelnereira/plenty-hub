'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/features/billing/utils/financials';

interface SalesChartProps {
    data: { date: string; total: number }[];
}

export const SalesChart = ({ data }: SalesChartProps) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        opacity={0.3}
                    />
                    <XAxis
                        dataKey="date"
                        fontSize={12}
                        stroke="var(--muted-foreground)"
                        tickFormatter={(val) => new Date(val).toLocaleDateString('es-PA', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis
                        fontSize={12}
                        stroke="var(--muted-foreground)"
                        tickFormatter={(val) => `$${val / 100}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--foreground)',
                        }}
                        formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Ventas']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('es-PA', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })}
                    />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#E60023"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#E60023', strokeWidth: 2, stroke: 'var(--card)' }}
                        activeDot={{ r: 6, fill: '#E60023', strokeWidth: 2, stroke: 'var(--card)' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
