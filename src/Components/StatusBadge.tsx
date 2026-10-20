import React from 'react';
import { ApplicationStatus } from '../Interfaces';
import { cn } from '../Utils/classNames';
import { STATUS_COLORS } from '../Utils/constants';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  'Başvuruldu': 'bg-glass/60 text-ink-soft border-glass/80',
  'Mülakat Bekleniyor': 'bg-amber-100/60 text-[#8c6b22] border-amber-200/80 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20',
  'Mülakat Yapıldı': 'bg-orange-200/50 text-[#5c311c] border-orange-300/80 dark:bg-orange-400/10 dark:text-orange-300 dark:border-orange-400/20',
  'Kabul Edildi': 'bg-moss/10 text-moss border-moss/20',
  'Reddedildi': 'bg-clay/10 text-clay border-clay/20',
};

export const StatusBadge: React.FC<{ status: ApplicationStatus; className?: string }> = ({ status, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border tracking-wide shadow-sm backdrop-blur-md whitespace-nowrap',
      STATUS_STYLES[status],
      className
    )}
  >
    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
    {status}
  </span>
);
