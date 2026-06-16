import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../Utils/classNames';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  colorClass = "text-[#2c5e4a]"
}) => {
  return (
    <div className="glass-panel p-6 group relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-bold text-[#6b4c3a] mb-2 tracking-wide font-serif">{title}</p>
          <h3 className="text-4xl font-black text-[#4a3f35] tracking-tight">{value}</h3>
        </div>
        <div className="relative">
          <div className={cn("p-4 rounded-2xl flex items-center justify-center bg-white/60 border border-white/80 shadow-sm relative z-10 group-hover:-rotate-12 transition-transform duration-300 backdrop-blur-md", colorClass)}>
            <Icon className="w-8 h-8" strokeWidth={2.5} />
          </div>
        </div>
      </div>
      {trend && (
        <div className="mt-5 flex items-center text-sm relative z-10 font-bold">
          <span className={cn("px-2 py-0.5 rounded-md", trend.isPositive ? "text-[#2c5e4a] bg-white/60 shadow-sm" : "text-[#c05c3e] bg-white/60 shadow-sm")}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-[#a38b76] ml-2">geçen aya göre</span>
        </div>
      )}
    </div>
  );
};
