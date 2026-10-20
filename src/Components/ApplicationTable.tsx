import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Edit, Trash2, MapPin, Calendar, Link as LinkIcon, Star, User, Copy } from 'lucide-react';
import { Application } from '../Interfaces';
import { StatusBadge } from './StatusBadge';
import { CompanyAvatar } from './CompanyAvatar';
import { useEditor } from '../Hooks/EditorContext';
import { useApplications } from '../Hooks/ApplicationContext';

interface ApplicationTableProps {
  applications: Application[];
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications }) => {
  const { openEditor: onEdit, requestDelete: onDelete } = useEditor();
  const { duplicateApplication } = useApplications();
  return (
    <div className="glass-panel overflow-hidden hidden md:block relative z-10">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-xs text-ink-soft uppercase tracking-wider bg-glass/40 border-b border-glass/60 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-5 font-bold font-serif">Firma & Pozisyon 🏢</th>
            <th className="px-4 py-5 font-bold font-serif">Aşama & Model 📊</th>
            <th className="px-4 py-5 font-bold font-serif">Detaylar 🌍</th>
            <th className="px-4 py-5 font-bold font-serif">Durum 🎯</th>
            <th className="px-6 py-5 font-bold font-serif text-right">İşlemler ⚙️</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-glass/40">
          {applications.map((app) => (
            <tr key={app.id} onDoubleClick={() => onEdit(app)} className="glass-panel-hover hover:bg-glass/50 transition-all duration-300 group hover:z-10 relative bg-transparent">
              <td className="px-6 py-5">
                <div className="flex items-center">
                  <CompanyAvatar name={app.companyName} className="mr-4 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <div className="font-bold text-base text-ink group-hover:text-clay transition-colors flex items-center">
                      {app.companyName}
                      {!!app.companyRating && (
                        <span className="flex items-center ml-2 text-xs text-sun bg-glass/50 px-1.5 py-0.5 rounded-md shadow-sm border border-glass/60">
                          {app.companyRating} <Star className="w-3 h-3 fill-current ml-0.5" />
                        </span>
                      )}
                    </div>
                    <div className="text-ink-soft font-medium">{app.position}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-5">
                <div className="flex flex-col space-y-1.5">
                  {app.interviewStage && app.interviewStage !== 'Henüz Yok' && (
                    <span className="text-xs font-semibold bg-purple-50/50 border border-purple-200/50 text-purple-700 dark:bg-purple-400/10 dark:border-purple-400/20 dark:text-purple-300 px-2 py-1 rounded-md w-max shadow-sm">
                      {app.interviewStage}
                    </span>
                  )}
                  {app.workModel && app.workModel !== 'Bilinmiyor' && (
                    <span className="text-xs font-semibold bg-blue-50/50 border border-blue-200/50 text-blue-700 dark:bg-sky-400/10 dark:border-sky-400/20 dark:text-sky-300 px-2 py-1 rounded-md w-max shadow-sm">
                      {app.workModel}
                    </span>
                  )}
                  {app.companyIndustry && (
                    <span className="text-xs font-medium text-ink-soft flex items-center bg-glass/40 px-2 py-1 rounded-md w-max border border-glass/50">
                      🏢 {app.companyIndustry}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-5">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-ink-soft text-xs font-medium bg-glass/50 border border-glass/60 shadow-sm px-2 py-1 rounded-lg w-max">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-moss" />
                    {app.city}
                  </div>
                  {app.contactPerson && (
                    <div className="flex items-center text-ink-soft text-xs font-medium px-2 py-0.5">
                      <User className="w-3.5 h-3.5 mr-1.5 text-clay" />
                      İK: {app.contactPerson}
                    </div>
                  )}
                  <div className="flex items-center text-ink-soft text-xs font-medium px-2 py-0.5">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-moss" />
                    {format(new Date(app.applicationDate), 'dd MMM yyyy', { locale: tr })}
                  </div>
                </div>
              </td>
              <td className="px-4 py-5">
                <StatusBadge status={app.status} />
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end space-x-2">
                  {app.jobUrl && (
                    <a 
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 text-ink-soft hover:text-clay hover:bg-glass/60 bg-glass/30 border border-glass/50 rounded-xl transition-all shadow-sm"
                      title="İlanı Gör"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  <button 
                    onClick={() => duplicateApplication(app.id)}
                    className="p-2.5 text-ink-soft hover:text-moss hover:bg-glass/60 bg-glass/30 border border-glass/50 rounded-xl transition-all shadow-sm"
                    title="Kopyala"
                    aria-label="Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit(app)}
                    className="p-2.5 text-ink-soft hover:text-moss hover:bg-glass/60 bg-glass/30 border border-glass/50 rounded-xl transition-all shadow-sm"
                    title="Düzenle"
                    aria-label="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(app.id)}
                    className="p-2.5 text-ink-soft hover:text-clay hover:bg-glass/60 bg-glass/30 border border-glass/50 rounded-xl transition-all shadow-sm"
                    title="Sil"
                    aria-label="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
