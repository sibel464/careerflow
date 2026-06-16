import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Edit, Trash2, MapPin, Calendar, Building2, Link as LinkIcon, DollarSign, Briefcase, Star, User, Coffee } from 'lucide-react';
import { Application } from '../Interfaces';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onEdit, onDelete }) => {
  return (
    <div className="glass-panel p-6 mb-4 md:hidden relative overflow-hidden group">
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-xl bg-white/60 text-[#2c5e4a] flex items-center justify-center mr-4 border border-white/80 shadow-sm backdrop-blur-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg font-serif text-[#4a3f35] leading-tight flex items-center">
              {application.companyName}
              {application.companyRating && application.companyRating > 0 && (
                <span className="flex items-center ml-2 text-xs text-[#e8b923] bg-white/50 px-1.5 py-0.5 rounded-md">
                  {application.companyRating} <Star className="w-3 h-3 fill-current ml-0.5" />
                </span>
              )}
            </h3>
            <p className="text-sm font-bold text-[#6b4c3a] mt-0.5">{application.position}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4 relative z-10 flex flex-wrap gap-2">
        <StatusBadge status={application.status} />
        {application.workModel && application.workModel !== 'Bilinmiyor' && (
          <span className="text-xs font-semibold bg-blue-50/50 border border-blue-200/50 text-blue-700 px-2 py-1.5 rounded-lg flex items-center shadow-sm">
            {application.workModel}
          </span>
        )}
        {application.interviewStage && application.interviewStage !== 'Henüz Yok' && (
          <span className="text-xs font-semibold bg-purple-50/50 border border-purple-200/50 text-purple-700 px-2 py-1.5 rounded-lg flex items-center shadow-sm">
            {application.interviewStage}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        <div className="flex items-center text-xs font-bold text-[#6b4c3a] bg-white/40 border border-white/60 shadow-sm px-3 py-2 rounded-xl">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#2c5e4a]" />
          <span className="truncate">{application.city}</span>
        </div>
        <div className="flex items-center text-xs font-bold text-[#6b4c3a] bg-white/40 border border-white/60 shadow-sm px-3 py-2 rounded-xl">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#c05c3e]" />
          <span className="truncate">{format(new Date(application.applicationDate), 'dd MMM yyyy', { locale: tr })}</span>
        </div>
        
        {application.contactPerson && (
          <div className="flex items-center text-xs font-bold text-[#6b4c3a] bg-white/40 border border-white/60 shadow-sm px-3 py-2 rounded-xl col-span-2">
            <User className="w-3.5 h-3.5 mr-1.5 text-[#2c5e4a]" />
            <span className="truncate">İK: {application.contactPerson}</span>
          </div>
        )}
        {application.salaryExpectation && (
          <div className="flex items-center text-xs font-bold text-[#2c5e4a] bg-white/50 border border-[#2c5e4a]/20 shadow-sm px-3 py-2 rounded-xl col-span-2">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            <span className="truncate">Teklif/Beklenti: {application.salaryExpectation}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-white/40 relative z-10">
        {application.jobUrl && (
          <a 
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-[#6b4c3a] bg-white/60 transition-all shadow-sm active:scale-95 border border-white/80"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            İlan
          </a>
        )}
        <button 
          onClick={() => onEdit(application)}
          className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-[#fdfbf7] bg-[#2c5e4a]/90 backdrop-blur-sm border border-[#3d7a62]/50 hover:bg-[#2c5e4a] transition-all shadow-md active:scale-95"
        >
          <Edit className="w-4 h-4 mr-2" />
          Düzenle
        </button>
        <button 
          onClick={() => onDelete(application.id)}
          className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-[#fdfbf7] bg-[#c05c3e]/90 backdrop-blur-sm border border-[#a0482d]/50 hover:bg-[#c05c3e] transition-all shadow-md active:scale-95"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
