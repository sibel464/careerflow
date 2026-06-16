import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Edit, Trash2, MapPin, Calendar, Building2, Briefcase, Link as LinkIcon, DollarSign, Star, User } from 'lucide-react';
import { Application } from '../Interfaces';
import { StatusBadge } from './StatusBadge';

interface ApplicationTableProps {
  applications: Application[];
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications, onEdit, onDelete }) => {
  return (
    <div className="glass-panel overflow-hidden hidden md:block relative z-10">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-xs text-[#6b4c3a] uppercase tracking-wider bg-white/40 border-b border-white/60 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-5 font-bold font-serif">Firma & Pozisyon 🏢</th>
            <th className="px-4 py-5 font-bold font-serif">Aşama & Model 📊</th>
            <th className="px-4 py-5 font-bold font-serif">Detaylar 🌍</th>
            <th className="px-4 py-5 font-bold font-serif">Durum 🎯</th>
            <th className="px-6 py-5 font-bold font-serif text-right">İşlemler ⚙️</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/40">
          {applications.map((app) => (
            <tr key={app.id} className="glass-panel-hover hover:bg-white/50 transition-all duration-300 group hover:z-10 relative bg-transparent">
              <td className="px-6 py-5">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-white/60 text-[#2c5e4a] flex items-center justify-center mr-4 border border-white/80 group-hover:scale-110 transition-all duration-300 shadow-sm backdrop-blur-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#4a3f35] group-hover:text-[#c05c3e] transition-colors flex items-center">
                      {app.companyName}
                      {app.companyRating && app.companyRating > 0 && (
                        <span className="flex items-center ml-2 text-xs text-[#e8b923] bg-white/50 px-1.5 py-0.5 rounded-md shadow-sm border border-white/60">
                          {app.companyRating} <Star className="w-3 h-3 fill-current ml-0.5" />
                        </span>
                      )}
                    </div>
                    <div className="text-[#6b4c3a] font-medium">{app.position}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-5">
                <div className="flex flex-col space-y-1.5">
                  {app.interviewStage && app.interviewStage !== 'Henüz Yok' && (
                    <span className="text-xs font-semibold bg-purple-50/50 border border-purple-200/50 text-purple-700 px-2 py-1 rounded-md w-max shadow-sm">
                      {app.interviewStage}
                    </span>
                  )}
                  {app.workModel && app.workModel !== 'Bilinmiyor' && (
                    <span className="text-xs font-semibold bg-blue-50/50 border border-blue-200/50 text-blue-700 px-2 py-1 rounded-md w-max shadow-sm">
                      {app.workModel}
                    </span>
                  )}
                  {app.companyIndustry && (
                    <span className="text-xs font-medium text-[#6b4c3a] flex items-center bg-white/40 px-2 py-1 rounded-md w-max border border-white/50">
                      🏢 {app.companyIndustry}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-5">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-[#6b4c3a] text-xs font-medium bg-white/50 border border-white/60 shadow-sm px-2 py-1 rounded-lg w-max">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#2c5e4a]" />
                    {app.city}
                  </div>
                  {app.contactPerson && (
                    <div className="flex items-center text-[#6b4c3a] text-xs font-medium px-2 py-0.5">
                      <User className="w-3.5 h-3.5 mr-1.5 text-[#c05c3e]" />
                      İK: {app.contactPerson}
                    </div>
                  )}
                  <div className="flex items-center text-[#6b4c3a] text-xs font-medium px-2 py-0.5">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#2c5e4a]" />
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
                      className="p-2.5 text-[#6b4c3a] hover:text-[#c05c3e] hover:bg-white/60 bg-white/30 border border-white/50 rounded-xl transition-all shadow-sm"
                      title="İlanı Gör"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  <button 
                    onClick={() => onEdit(app)}
                    className="p-2.5 text-[#6b4c3a] hover:text-[#2c5e4a] hover:bg-white/60 bg-white/30 border border-white/50 rounded-xl transition-all shadow-sm"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(app.id)}
                    className="p-2.5 text-[#6b4c3a] hover:text-[#c05c3e] hover:bg-white/60 bg-white/30 border border-white/50 rounded-xl transition-all shadow-sm"
                    title="Sil"
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
