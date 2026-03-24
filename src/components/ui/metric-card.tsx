'use client';

import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantColors = {
  default: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
  success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
  warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
  danger: 'text-red-600 bg-red-50 dark:bg-red-950/50',
};

export function MetricCard({ title, value, unit, icon, variant = 'default' }: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {unit && <span className="text-sm text-zinc-500 dark:text-zinc-400">{unit}</span>}
            </div>
          </div>
          <div className={cn('rounded-lg p-3', variantColors[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
