import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { FacilityStatus, AlertSeverity, AlertStatus } from '@/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles: Record<string, string> = {
  default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: FacilityStatus }) {
  const map: Record<FacilityStatus, { label: string; variant: BadgeProps['variant'] }> = {
    normal: { label: 'Норма', variant: 'success' },
    warning: { label: 'Предупреждение', variant: 'warning' },
    critical: { label: 'Авария', variant: 'danger' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const map: Record<AlertSeverity, { label: string; variant: BadgeProps['variant'] }> = {
    low: { label: 'Низкий', variant: 'info' },
    medium: { label: 'Средний', variant: 'warning' },
    high: { label: 'Высокий', variant: 'warning' },
    critical: { label: 'Критический', variant: 'danger' },
  };
  const { label, variant } = map[severity];
  return <Badge variant={variant}>{label}</Badge>;
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const map: Record<AlertStatus, { label: string; variant: BadgeProps['variant'] }> = {
    active: { label: 'Активно', variant: 'danger' },
    acknowledged: { label: 'Принято', variant: 'warning' },
    resolved: { label: 'Устранено', variant: 'success' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
