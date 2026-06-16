import React from 'react';
import { ApplicationStatus } from '../Interfaces';
import { cn } from '../Utils/classNames';

export const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Başvuruldu':
        return 'bg-white/60 text-[#6b4c3a] border-white/80';
      case 'Mülakat Bekleniyor':
        return 'bg-amber-100/60 text-[#8c6b22] border-amber-200/80';
      case 'Mülakat Yapıldı':
        return 'bg-orange-200/50 text-[#5c311c] border-orange-300/80';
      case 'Kabul Edildi':
        return 'bg-[#2c5e4a]/10 text-[#2c5e4a] border-[#2c5e4a]/20';
      case 'Reddedildi':
        return 'bg-[#c05c3e]/10 text-[#c05c3e] border-[#c05c3e]/20';
      default:
        return 'bg-white/60 text-[#6b4c3a] border-white/80';
    }
  };

  return (
    <span className={cn('px-3 py-1.5 text-xs font-bold rounded-lg border tracking-wide shadow-sm backdrop-blur-md', getStatusStyles())}>
      {status}
    </span>
  );
};
