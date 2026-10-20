import React, { useEffect, useState } from 'react';
import { Plus, Search, SortAsc, SortDesc, Briefcase, LayoutList, Columns3, X } from 'lucide-react';
import { useApplications } from '../Hooks/ApplicationContext';
import { useEditor } from '../Hooks/EditorContext';
import { ApplicationTable } from '../Components/ApplicationTable';
import { ApplicationCard } from '../Components/ApplicationCard';
import { KanbanBoard } from '../Components/KanbanBoard';
import { ApplicationStatus } from '../Interfaces';
import { STATUS_OPTIONS, STATUS_COLORS } from '../Utils/constants';
import { cn } from '../Utils/classNames';

type View = 'list' | 'board';
const VIEW_KEY = 'careerflow_view';

const normalize = (text: string) => text.toLocaleLowerCase('tr-TR');

export const Applications: React.FC = () => {
  const { applications } = useApplications();
  const { openEditor } = useEditor();

  const [view, setView] = useState<View>(() => (localStorage.getItem(VIEW_KEY) === 'board' ? 'board' : 'list'));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'Tümü'>('Tümü');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  const query = normalize(searchTerm.trim());
  const searched = applications.filter(app =>
    !query || [app.companyName, app.position, app.city, app.companyIndustry || '', app.platform || '']
      .some(field => normalize(field).includes(query))
  );

  // The board already groups by status, so the status filter only applies to the list.
  const filteredApps = searched
    .filter(app => view === 'board' || statusFilter === 'Tümü' || app.status === statusFilter)
    .sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') return (new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime()) * dir;
      if (sortBy === 'rating') return ((a.companyRating || 0) - (b.companyRating || 0)) * dir;
      return a.companyName.localeCompare(b.companyName, 'tr') * dir;
    });

  const countFor = (status: ApplicationStatus | 'Tümü') =>
    status === 'Tümü' ? searched.length : searched.filter(app => app.status === status).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Başvurular 🌿</h1>
          <p className="text-ink-soft mt-2">Kariyer fırsatlarını buradan yönet, sürükle ve detaylandır.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-glass/40 border border-glass/60 rounded-xl backdrop-blur-md" role="tablist" aria-label="Görünüm">
            {([['list', LayoutList, 'Liste'], ['board', Columns3, 'Pano']] as const).map(([key, Icon, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all',
                  view === key ? 'bg-glass/80 text-moss shadow-sm' : 'text-ink-soft hover:text-ink'
                )}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
          <button onClick={() => openEditor(null)} className="btn-primary px-5 py-3 text-sm">
            <Plus className="w-5 h-5 mr-2" />
            Yeni Ekle
          </button>
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Firma, pozisyon, şehir veya sektör ara... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 glass-input rounded-xl text-sm text-ink font-medium placeholder:text-ink-muted"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} aria-label="Aramayı temizle" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-clay">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-ink-muted" /> : <SortDesc className="w-4 h-4 text-ink-muted" />}
            </div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as typeof sortBy);
                setSortOrder(order as typeof sortOrder);
              }}
              aria-label="Sıralama"
              className="w-full pl-11 pr-8 py-3 glass-input rounded-xl text-sm font-bold text-ink appearance-none"
            >
              <option value="date-desc">En Yeni Tarih</option>
              <option value="date-asc">En Eski Tarih</option>
              <option value="company-asc">Firma (A-Z)</option>
              <option value="company-desc">Firma (Z-A)</option>
              <option value="rating-desc">En Yüksek Puan</option>
            </select>
          </div>
        </div>

        {view === 'list' && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
            {(['Tümü', ...STATUS_OPTIONS] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all',
                  statusFilter === status
                    ? 'bg-moss text-white border-moss shadow-md'
                    : 'bg-glass/40 text-ink-soft border-glass/60 hover:bg-glass/70'
                )}
              >
                {status !== 'Tümü' && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                )}
                {status === 'Tümü' ? 'Tümü' : status}
                <span className={cn('px-1.5 rounded-full text-[10px]', statusFilter === status ? 'bg-white/25' : 'bg-glass/60')}>
                  {countFor(status)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel p-16 text-center">
          <div className="w-24 h-24 bg-glass/60 border border-glass/80 text-ink-soft mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Briefcase className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-ink mb-3">Hiç Başvuru Bulunamadı 🏜️</h3>
          <p className="text-ink-soft text-lg max-w-md mx-auto mb-8">Kariyer yolculuğunun ilk adımını at ve başvurularını eklemeye başla.</p>
          <button onClick={() => openEditor(null)} className="btn-primary px-8 py-4 text-lg hover:scale-105">
            İlk Başvuruyu Ekle ✨
          </button>
        </div>
      ) : view === 'board' ? (
        <KanbanBoard applications={filteredApps} />
      ) : filteredApps.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-ink-soft font-medium text-lg">Arama kriterlerine uygun başvuru bulunamadı. 🔍</p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('Tümü'); }}
            className="btn-ghost mt-4 px-4 py-2 text-sm"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <>
          <ApplicationTable applications={filteredApps} />
          <div className="md:hidden space-y-4">
            {filteredApps.map(app => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
