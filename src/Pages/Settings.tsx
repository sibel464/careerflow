import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Download, Upload, Trash2, ShieldCheck, User, Palette, Target, FileSpreadsheet, Sparkles, Moon, Sun, PartyPopper, Briefcase, GraduationCap, Shirt,
} from 'lucide-react';
import { useTheme } from '../Hooks/ThemeContext';
import { useApplications } from '../Hooks/ApplicationContext';
import { usePreferences } from '../Hooks/PreferencesContext';
import { useLocalStorage, DATA_EVENT } from '../Hooks/useLocalStorage';
import { useSpace } from '../Hooks/useSpace';
import { ConfirmModal } from '../Components/ConfirmModal';
import { AvatarBuilder } from '../Components/AvatarBuilder';
import { MOTIFS, PALETTES } from '../Utils/palettes';
import { MotifShape } from '../Components/ThemeMotifs';
import { DecorRows } from '../Components/DecorPicker';
import { Application } from '../Interfaces';
import { fireConfetti } from '../Utils/confetti';
import { STUDY_KEYS, StudySettings, DEFAULT_SETTINGS, formatMinutes } from '../Utils/study';
import { MOOD_KEY } from '../Utils/mood';
import { PET_COLORS, PET_KEY, PetState, SPECIES, Species, newPet } from '../Utils/pet';
import { allMedia, saveMedia } from '../Utils/mediaStore';
import { cn } from '../Utils/classNames';

/** Where the little shapes sit on each theme card. */
const THEME_SPOTS = [
  { l: '8%', t: '10%', s: 16, r: -12, o: 0.55 }, { l: '30%', t: '22%', s: 11, r: 20, o: 0.4 }, { l: '52%', t: '8%', s: 20, r: 8, o: 0.6 },
  { l: '74%', t: '26%', s: 13, r: -25, o: 0.45 }, { l: '88%', t: '6%', s: 10, r: 35, o: 0.35 }, { l: '18%', t: '38%', s: 9, r: 0, o: 0.3 },
  { l: '64%', t: '42%', s: 9, r: 15, o: 0.3 }, { l: '86%', t: '52%', s: 15, r: -8, o: 0.45 },
];

const PREFIX = 'careerflow_';
const BACKUP_APP = 'careerflow';

const download = (content: string, filename: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const today = () => new Date().toISOString().split('T')[0];

const isApplication = (value: unknown): value is Application => {
  const app = value as Application;
  return !!app && typeof app.id === 'string' && typeof app.companyName === 'string' &&
    typeof app.position === 'string' && typeof app.status === 'string' && typeof app.applicationDate === 'string';
};

/** Every piece of data the app keeps, from both spaces. */
const collectBackup = () => {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    try { data[key] = JSON.parse(localStorage.getItem(key)!); } catch { data[key] = localStorage.getItem(key); }
  }
  return { app: BACKUP_APP, version: 2, exportedAt: new Date().toISOString(), data };
};

type PendingImport =
  | { kind: 'full'; data: Record<string, unknown>; media?: Record<string, string>; summary: string }
  | { kind: 'applications'; apps: Application[] };

type ResetTarget = 'career' | 'study' | null;

const STUDY_RESET_KEYS = [STUDY_KEYS.subjects, STUDY_KEYS.exams, STUDY_KEYS.tasks, STUDY_KEYS.log, STUDY_KEYS.redemptions, MOOD_KEY, 'careerflow_vision'];
const CAREER_RESET_KEYS = ['careerflow_simulator'];

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; className?: string }> = ({ title, icon: Icon, children, className }) => (
  <section className={cn('glass-panel p-6 sm:p-8', className)}>
    <h2 className="text-xl font-bold font-serif text-ink mb-6 flex items-center">
      <span className="p-2 bg-glass/60 rounded-xl mr-3 border border-glass/80 text-moss">
        <Icon className="w-5 h-5" />
      </span>
      {title}
    </h2>
    {children}
  </section>
);

const Row: React.FC<{ title: React.ReactNode; description: string; children: React.ReactNode; danger?: boolean }> = ({ title, description, children, danger }) => (
  <div className={cn(
    'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border shadow-sm',
    danger ? 'bg-clay/5 border-clay/25' : 'bg-glass/50 border-glass/60'
  )}>
    <div>
      <p className={cn('font-bold', danger ? 'text-clay' : 'text-ink')}>{title}</p>
      <p className={cn('text-sm mt-1', danger ? 'text-clay-deep' : 'text-ink-soft')}>{description}</p>
    </div>
    <div className="flex gap-2 shrink-0">{children}</div>
  </div>
);

const Stepper: React.FC<{ value: string; onMinus: () => void; onPlus: () => void }> = ({ value, onMinus, onPlus }) => (
  <div className="flex items-center gap-2">
    <button onClick={onMinus} className="btn-ghost w-10 h-10 text-lg" aria-label="Azalt">−</button>
    <span className="min-w-16 text-center text-lg font-black text-ink">{value}</span>
    <button onClick={onPlus} className="btn-ghost w-10 h-10 text-lg" aria-label="Artır">+</button>
  </div>
);

export const Settings: React.FC = () => {
  const space = useSpace();
  const { applications, resetApplications, importApplications } = useApplications();
  const [studySettings, setStudySettings] = useLocalStorage<StudySettings>(STUDY_KEYS.settings, DEFAULT_SETTINGS);
  const { preferences, updatePreferences } = usePreferences();
  const [pet, setPet] = useLocalStorage<PetState>(PET_KEY, newPet);
  const { theme, toggleTheme } = useTheme();
  const [resetTarget, setResetTarget] = useState<ResetTarget>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    const backup = { ...collectBackup(), media: await allMedia().catch(() => ({})) };
    download(JSON.stringify(backup, null, 2), `careerflow_tam_yedek_${today()}.json`, 'application/json');
    toast.success(`Tam yedek indirildi (${Object.keys(backup.data).length} veri grubu). 💾`);
  };

  const handleCsvExport = () => {
    const columns: [string, (app: Application) => string | number | undefined][] = [
      ['Firma', a => a.companyName], ['Pozisyon', a => a.position], ['Şehir', a => a.city],
      ['Başvuru Tarihi', a => a.applicationDate.split('T')[0]], ['Durum', a => a.status],
      ['Mülakat Aşaması', a => a.interviewStage], ['Mülakat Tarihi', a => a.interviewDate?.slice(0, 16).replace('T', ' ')],
      ['Çalışma Modeli', a => a.workModel], ['Sektör', a => a.companyIndustry], ['Platform', a => a.platform],
      ['Maaş', a => a.salaryExpectation], ['Puan', a => a.companyRating], ['İletişim', a => a.contactPerson],
      ['İlan Linki', a => a.jobUrl], ['Notlar', a => a.notes],
    ];
    const escape = (value: string | number | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      columns.map(([name]) => escape(name)).join(';'),
      ...applications.map(app => columns.map(([, get]) => escape(get(app))).join(';')),
    ];
    // BOM so Excel opens Turkish characters correctly.
    download('﻿' + rows.join('\r\n'), `basvurular_${today()}.csv`, 'text/csv;charset=utf-8');
    toast.success('Excel dosyası hazır. 📊');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.app === BACKUP_APP && parsed.data && typeof parsed.data === 'object') {
        const data = parsed.data as Record<string, unknown>;
        const count = (key: string) => (Array.isArray(data[key]) ? (data[key] as unknown[]).length : 0);
        setPendingImport({
          kind: 'full',
          data,
          media: parsed.media && typeof parsed.media === 'object' ? parsed.media : undefined,
          summary: `${count('careerflow_applications')} başvuru, ${count(STUDY_KEYS.subjects)} ders, ${count(STUDY_KEYS.tasks)} görev, ${count(STUDY_KEYS.log)} çalışma kaydı`,
        });
      } else if (Array.isArray(parsed) && parsed.every(isApplication)) {
        setPendingImport({ kind: 'applications', apps: parsed });
      } else {
        throw new Error('invalid');
      }
    } catch {
      toast.error('Bu dosya geçerli bir CareerFlow yedeği değil. 🍂');
    }
  };

  const applyImport = async () => {
    if (!pendingImport) return;
    if (pendingImport.kind === 'applications') {
      importApplications(pendingImport.apps);
      return;
    }
    Object.entries(pendingImport.data).forEach(([key, value]) => {
      if (key.startsWith(PREFIX)) localStorage.setItem(key, JSON.stringify(value));
    });
    for (const [id, dataUrl] of Object.entries(pendingImport.media ?? {})) await saveMedia(id, dataUrl).catch(() => undefined);
    toast.success('Yedek geri yüklendi, sayfa yenileniyor… 📦');
    window.setTimeout(() => window.location.reload(), 900);
  };

  const applyReset = () => {
    const keys = resetTarget === 'study' ? STUDY_RESET_KEYS : CAREER_RESET_KEYS;
    keys.forEach(key => localStorage.setItem(key, '[]'));
    window.dispatchEvent(new CustomEvent(DATA_EVENT));
    if (resetTarget === 'career') resetApplications(false);
    else toast.info('Çalışma verileri temizlendi. Yepyeni bir sayfa! 📄');
  };

  const careerGoal = (
    <Row title={<span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-ink-muted" /> Haftalık başvuru hedefi</span>} description="Kariyer panosundaki hedef halkası buna göre dolar.">
      <Stepper
        value={`${preferences.weeklyGoal}`}
        onMinus={() => updatePreferences({ weeklyGoal: Math.max(1, preferences.weeklyGoal - 1) })}
        onPlus={() => updatePreferences({ weeklyGoal: Math.min(50, preferences.weeklyGoal + 1) })}
      />
    </Row>
  );
  const studyGoal = (
    <Row title={<span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-ink-muted" /> Günlük çalışma hedefi</span>} description="Çalışma alanındaki hedef halkası buna göre dolar.">
      <Stepper
        value={formatMinutes(studySettings.dailyGoal)}
        onMinus={() => setStudySettings(s => ({ ...s, dailyGoal: Math.max(15, s.dailyGoal - 15) }))}
        onPlus={() => setStudySettings(s => ({ ...s, dailyGoal: Math.min(720, s.dailyGoal + 15) }))}
      />
    </Row>
  );

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Ayarlar ⚙️</h1>
        <p className="text-ink-soft mt-2">Profilin, hedeflerin ve verilerin. İki alan için de tek bir yerden.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Section title="Avatarım" icon={Shirt} className="xl:col-span-2">
          <AvatarBuilder />
        </Section>

        <Section title="Profil" icon={User}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="userName" className="block text-sm font-bold text-ink-soft">Sana nasıl hitap edelim?</label>
              <input
                id="userName"
                value={preferences.userName}
                onChange={(e) => updatePreferences({ userName: e.target.value })}
                placeholder="Adın 🌸"
                maxLength={30}
                className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium placeholder:text-ink-muted"
              />
            </div>
            <Row title="Kariyer modülü 💼" description="Başvuru, mülakat ve teklif takibi için ayrı bir alan. İş/staj ararken aç; verilerin kapalıyken de saklanır.">
              <button
                role="switch"
                aria-checked={preferences.careerModule}
                onClick={() => updatePreferences({ careerModule: !preferences.careerModule })}
                className={cn('relative w-14 h-8 rounded-full transition-colors', preferences.careerModule ? 'bg-moss' : 'bg-sand')}
              >
                <span className={cn('absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform', preferences.careerModule && 'translate-x-6')} />
              </button>
            </Row>
            <Row title="Yürüyüş yolu 🚶" description="Ana sayfada avatarın küçük bir patikada gezinsin, sana hatırlatmalar yapsın.">
              <button
                role="switch"
                aria-checked={preferences.companion}
                onClick={() => updatePreferences({ companion: !preferences.companion })}
                className={cn('relative w-14 h-8 rounded-full transition-colors', preferences.companion ? 'bg-moss' : 'bg-sand')}
              >
                <span className={cn('absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform', preferences.companion && 'translate-x-6')} />
              </button>
            </Row>
            <Row title={`Evcil hayvanım ${SPECIES[pet.species].emoji}`} description={`${pet.name} ekranın her yerinde gezinsin; odaklandıkça büyüsün, görev bitirdikçe sevinsin. Ona tıklayıp besleyebilir, oynayabilirsin.`}>
              <button
                role="switch"
                aria-checked={pet.enabled}
                onClick={() => setPet(p => ({ ...p, enabled: !p.enabled }))}
                className={cn('relative w-14 h-8 rounded-full transition-colors', pet.enabled ? 'bg-moss' : 'bg-sand')}
              >
                <span className={cn('absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform', pet.enabled && 'translate-x-6')} />
              </button>
            </Row>
            {pet.enabled && (
              <div className="space-y-3 rounded-2xl bg-glass/40 border border-glass/60 p-4">
                <input value={pet.name} onChange={e => setPet(p => ({ ...p, name: e.target.value.slice(0, 16) }))} placeholder="Adı" aria-label="Evcil hayvanının adı"
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-ink font-bold" />
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(SPECIES) as Species[]).map(s => (
                    <button key={s} onClick={() => setPet(p => ({ ...p, species: s }))}
                      className={cn('rounded-xl py-2 text-xs font-bold transition-all', pet.species === s ? 'bg-moss/15 ring-2 ring-moss/50 text-ink' : 'bg-glass/40 hover:bg-glass/70 text-ink-soft')}>
                      <span className="block text-2xl">{SPECIES[s].emoji}</span>{SPECIES[s].label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {PET_COLORS.map(c => (
                    <button key={c.value} onClick={() => setPet(p => ({ ...p, color: c.value }))} title={c.name} aria-label={c.name}
                      className={cn('w-8 h-8 rounded-full border-2 border-black/10 transition-transform', pet.color === c.value && 'ring-2 ring-moss ring-offset-2 ring-offset-cream scale-110')} style={{ background: c.value }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        <div className="space-y-8">
          <Section title="Hedefler" icon={Target}>
            <div className="space-y-4">
              {space === 'study' ? <>{studyGoal}{careerGoal}</> : <>{careerGoal}{studyGoal}</>}
            </div>
          </Section>

          <Section title="Görünüm" icon={Palette}>
            <div className="space-y-4">
              <div>
                <p className="font-bold text-ink mb-1">Renk teması</p>
                <p className="text-sm text-ink-soft mb-3">Kişisel alanın tüm renkleri buna göre değişir.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PALETTES.map(p => {
                    const active = preferences.palette === p.id;
                    const shapes = MOTIFS[p.id].shapes;
                    return (
                      <button key={p.id} onClick={() => updatePreferences({ palette: p.id })} aria-pressed={active}
                        className={cn('group relative rounded-2xl overflow-hidden text-left border-2 transition-all duration-300',
                          active ? 'border-moss shadow-lg -translate-y-0.5' : 'border-glass/70 hover:-translate-y-0.5 hover:shadow-md')}
                        style={{ background: p.bg }}>
                        {/* Its own little wallpaper of shapes */}
                        <span className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-xl opacity-80" style={{ background: p.blob }} aria-hidden />
                        {THEME_SPOTS.map((spot, i) => (
                          <MotifShape key={i} shape={shapes[i % shapes.length]} color={i % 3 === 1 ? p.accent : p.primary}
                            className="absolute pointer-events-none transition-transform duration-500 group-hover:scale-110"
                            style={{ left: spot.l, top: spot.t, width: spot.s, height: spot.s, opacity: spot.o, transform: `rotate(${spot.r}deg)` }} />
                        ))}
                        <div className="relative px-3 pt-14 pb-3">
                          <div className="flex items-center gap-1.5 mb-2" aria-hidden>
                            <span className="h-2.5 w-10 rounded-full" style={{ background: p.primary }} />
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.blob }} />
                          </div>
                          <p className="text-sm font-black" style={{ color: p.ink }}>{p.emoji} {p.name}</p>
                          <p className="text-[11px] font-semibold leading-tight" style={{ color: p.ink, opacity: 0.6 }}>{p.mood} · {MOTIFS[p.id].label.toLocaleLowerCase('tr')}</p>
                        </div>
                        {active && (
                          <span className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shadow" style={{ background: p.primary }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-glass/40 border border-glass/60 px-4 py-3 cursor-pointer">
                  <span>
                    <span className="block text-sm font-bold text-ink">Süsleme şekilleri ✨</span>
                    <span className="block text-xs text-ink-soft">Temanın şekilleri arka planda hafifçe süzülsün.</span>
                  </span>
                  <button
                    role="switch"
                    aria-checked={preferences.motifs}
                    onClick={() => updatePreferences({ motifs: !preferences.motifs })}
                    className={cn('relative w-14 h-8 shrink-0 rounded-full transition-colors', preferences.motifs ? 'bg-moss' : 'bg-sand')}
                  >
                    <span className={cn('absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform', preferences.motifs && 'translate-x-6')} />
                  </button>
                </label>
              </div>
              <div>
                <p className="font-bold text-ink mb-1">Dekor 🪵</p>
                <p className="text-sm text-ink-soft mb-3">Kitaplık rafları, panolar, defter ve kâğıtların malzemesi.</p>
                <DecorRows />
              </div>
              <Row title="Gündüz / gece" description={theme === 'dark' ? 'Gece modu: göz yormayan koyu tonlar.' : 'Gündüz modu: açık ve ferah tonlar.'}>
                <button onClick={toggleTheme} className="btn-ghost px-4 py-2.5 text-sm">
                  {theme === 'dark' ? <><Sun className="w-4 h-4 mr-2" /> Aydınlık</> : <><Moon className="w-4 h-4 mr-2" /> Karanlık</>}
                </button>
              </Row>
              <Row title="Kutlamalar 🎉" description="Kabul, rozet ve ödüllerde konfeti patlasın.">
                <button
                  role="switch"
                  aria-checked={preferences.celebrate}
                  onClick={() => {
                    const celebrate = !preferences.celebrate;
                    updatePreferences({ celebrate });
                    if (celebrate) fireConfetti(80);
                  }}
                  className={cn('relative w-14 h-8 rounded-full transition-colors', preferences.celebrate ? 'bg-moss' : 'bg-sand')}
                >
                  <span className={cn('absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform', preferences.celebrate && 'translate-x-6')}>
                    <PartyPopper className="w-3.5 h-3.5 text-moss" />
                  </span>
                </button>
              </Row>
            </div>
          </Section>
        </div>

        <Section title="Verilerin" icon={ShieldCheck} className="xl:col-span-2">
          <p className="text-sm text-ink-soft mb-5 -mt-2">
            Her şey yalnızca bu tarayıcıda saklanıyor, hiçbir sunucuya gönderilmiyor. Tarayıcı verisini temizlersen kaybolur; ara sıra tam yedek almayı unutma. 🌿
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Row title="Tam yedek al 💾" description="Günlük (fotoğraf ve çizimleriyle), defterler, dersler, görevler, çalışma geçmişi, başvurular… hepsi tek dosyada.">
              <button onClick={handleBackup} className="btn-primary px-5 py-2.5 shadow-md">
                <Download className="w-4 h-4 mr-2" /> İndir
              </button>
            </Row>
            <Row title="Yedekten geri yükle 📦" description="Tam yedek ya da eski sürümün başvuru yedeği.">
              <input ref={fileInput} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
              <button onClick={() => fileInput.current?.click()} className="btn-ghost px-5 py-2.5">
                <Upload className="w-4 h-4 mr-2" /> Yükle
              </button>
            </Row>
            <Row title="Başvuruları Excel'e aktar 📊" description={`${applications.length} başvuru, mülakat tarihleriyle birlikte CSV olarak.`}>
              <button onClick={handleCsvExport} className="btn-ghost px-5 py-2.5">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
              </button>
            </Row>
            <Row title="Örnek başvurular 🌱" description="Kariyer alanını denemek için demo başvuruları yükle.">
              <button onClick={() => resetApplications(true)} className="btn-ghost px-5 py-2.5">
                <Sparkles className="w-4 h-4 mr-2" /> Yükle
              </button>
            </Row>
            <Row title="Kariyer verilerini sıfırla" description="Başvurular ve simülatör provaları silinir." danger>
              <button onClick={() => setResetTarget('career')} className="px-5 py-2.5 bg-clay/90 text-white font-bold rounded-xl hover:bg-clay transition-all flex items-center shadow-md active:scale-95">
                <Trash2 className="w-4 h-4 mr-2" /> Sıfırla
              </button>
            </Row>
            <Row title="Çalışma verilerini sıfırla" description="Dersler, sınavlar, görevler, çalışma geçmişi, ruh hali ve hayal panosu silinir." danger>
              <button onClick={() => setResetTarget('study')} className="px-5 py-2.5 bg-clay/90 text-white font-bold rounded-xl hover:bg-clay transition-all flex items-center shadow-md active:scale-95">
                <Trash2 className="w-4 h-4 mr-2" /> Sıfırla
              </button>
            </Row>
          </div>
        </Section>
      </div>

      <ConfirmModal
        isOpen={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        onConfirm={applyReset}
        title={resetTarget === 'study' ? 'Çalışma Verilerini Sıfırla' : 'Kariyer Verilerini Sıfırla'}
        message="Bu veriler kalıcı olarak silinecek. Önce tam yedek almak ister misin? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
      />
      <ConfirmModal
        isOpen={pendingImport !== null}
        onClose={() => setPendingImport(null)}
        onConfirm={applyImport}
        title="Yedeği Geri Yükle"
        message={pendingImport?.kind === 'full'
          ? `Yedekte ${pendingImport.summary} var. Mevcut verilerinin yerini alacak. Devam edilsin mi?`
          : `Yedekteki ${pendingImport?.kind === 'applications' ? pendingImport.apps.length : 0} başvuru, mevcut ${applications.length} başvurunun yerini alacak. Devam edilsin mi?`}
        confirmText="Geri Yükle"
      />
    </div>
  );
};
