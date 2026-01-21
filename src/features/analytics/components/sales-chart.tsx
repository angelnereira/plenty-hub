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
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        fontSize={12}
                        tickFormatter={(val) => new Date(val).toLocaleDateString('es-PA', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis
                        fontSize={12}
                        tickFormatter={(val) => `$${val / 100}`}
                    />
                    <Tooltip
                        formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Total Sales']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
