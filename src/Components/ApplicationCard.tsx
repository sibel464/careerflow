import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Edit, Trash2, MapPin, Calendar, Link as LinkIcon, DollarSign, Star, User, Copy } from 'lucide-react';
import { Application } from '../Interfaces';
import { StatusBadge } from './StatusBadge';
import { CompanyAvatar } from './CompanyAvatar';
import { useEditor } from '../Hooks/EditorContext';
import { useApplications } from '../Hooks/ApplicationContext';

interface ApplicationCardProps {
  application: Application;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const { openEditor: onEdit, requestDelete: onDelete } = useEditor();
  const { duplicateApplication } = useApplications();
  return (
    <div className="glass-panel p-6 mb-4 md:hidden relative overflow-hidden group">
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center">
          <CompanyAvatar name={application.companyName} className="mr-4" />
          <div>
            <h3 className="font-extrabold text-lg font-serif text-ink leading-tight flex items-center">
              {application.companyName}
              {!!application.companyRating && (
                <span className="flex items-center ml-2 text-xs text-sun bg-glass/50 px-1.5 py-0.5 rounded-md">
                  {application.companyRating} <Star className="w-3 h-3 fill-current ml-0.5" />
                </span>
              )}
            </h3>
            <p className="text-sm font-bold text-ink-soft mt-0.5">{application.position}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4 relative z-10 flex flex-wrap gap-2">
        <StatusBadge status={application.status} />
        {application.workModel && application.workModel !== 'Bilinmiyor' && (
          <span className="text-xs font-semibold bg-blue-50/50 border border-blue-200/50 text-blue-700 dark:bg-sky-400/10 dark:border-sky-400/20 dark:text-sky-300 px-2 py-1.5 rounded-lg flex items-center shadow-sm">
            {application.workModel}
          </span>
        )}
        {application.interviewStage && application.interviewStage !== 'Henüz Yok' && (
          <span className="text-xs font-semibold bg-purple-50/50 border border-purple-200/50 text-purple-700 dark:bg-purple-400/10 dark:border-purple-400/20 dark:text-purple-300 px-2 py-1.5 rounded-lg flex items-center shadow-sm">
            {application.interviewStage}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        <div className="flex items-center text-xs font-bold text-ink-soft bg-glass/40 border border-glass/60 shadow-sm px-3 py-2 rounded-xl">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-moss" />
          <span className="truncate">{application.city}</span>
        </div>
        <div className="flex items-center text-xs font-bold text-ink-soft bg-glass/40 border border-glass/60 shadow-sm px-3 py-2 rounded-xl">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-clay" />
          <span className="truncate">{format(new Date(application.applicationDate), 'dd MMM yyyy', { locale: tr })}</span>
        </div>
        
        {application.contactPerson && (
          <div className="flex items-center text-xs font-bold text-ink-soft bg-glass/40 border border-glass/60 shadow-sm px-3 py-2 rounded-xl col-span-2">
            <User className="w-3.5 h-3.5 mr-1.5 text-moss" />
            <span className="truncate">İK: {application.contactPerson}</span>
          </div>
        )}
        {application.salaryExpectation && (
          <div className="flex items-center text-xs font-bold text-moss bg-glass/50 border border-moss/20 shadow-sm px-3 py-2 rounded-xl col-span-2">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            <span className="truncate">Teklif/Beklenti: {application.salaryExpectation}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-glass/40 relative z-10">
        {application.jobUrl && (
          <a 
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-ink-soft bg-glass/60 transition-all shadow-sm active:scale-95 border border-glass/80"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            İlan
          </a>
        )}
        <button 
          onClick={() => onEdit(application)}
          className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-[#fdfbf7] bg-moss/90 backdrop-blur-sm border border-moss-light/50 hover:bg-moss transition-all shadow-md active:scale-95"
        >
          <Edit className="w-4 h-4 mr-2" />
          Düzenle
        </button>
        <button 
          onClick={() => duplicateApplication(application.id)}
          aria-label="Kopyala"
          className="flex items-center justify-center py-2.5 px-3 rounded-xl text-ink-soft bg-glass/60 transition-all shadow-sm active:scale-95 border border-glass/80"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(application.id)}
          aria-label="Sil"
          className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-[#fdfbf7] bg-clay/90 backdrop-blur-sm border border-clay-deep/50 hover:bg-clay transition-all shadow-md active:scale-95"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
