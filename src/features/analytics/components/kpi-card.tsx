'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
}

export const KPICard = ({ title, value, icon: Icon, description, trend }: KPICardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card hover className="overflow-hidden relative">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-ueta-red/5 blur-3xl" />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                        {title}
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-ueta-red/10">
                        <Icon className="h-4 w-4 text-ueta-red" />
                    </div>
                </CardHeader>
                <CardContent className="relative">
                    <div className="text-2xl md:text-3xl font-bold tracking-tight">
                        {value}
                    </div>
                    {description && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            {description}
                        </p>
                    )}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.isUp ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {trend.isUp ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            <span>{trend.value}% desde el mes pasado</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};
