import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Copy, Mail, Download, Shuffle, Check } from 'lucide-react';
import { useApplications } from '../Hooks/ApplicationContext';
import { usePreferences } from '../Hooks/PreferencesContext';
import { CompanyAvatar } from '../Components/CompanyAvatar';
import { TEMPLATE_KINDS, TemplateKind, Tone, buildTemplate } from '../Utils/templates';
import { cn } from '../Utils/classNames';
import { Application } from '../Interfaces';

const SKILLS_KEY = 'careerflow_skills';
const FREE = '__free';

export const Studio: React.FC = () => {
  const { applications } = useApplications();
  const { preferences, updatePreferences } = usePreferences();
  const [appId, setAppId] = useState(applications[0]?.id ?? FREE);
  const [manual, setManual] = useState({ companyName: '', position: '', contactPerson: '' });
  const [kind, setKind] = useState<TemplateKind>('cover');
  const [tone, setTone] = useState<Tone>('formal');
  const [variant, setVariant] = useState(0);
  const [skills, setSkills] = useState(() => localStorage.getItem(SKILLS_KEY) ?? 'React, TypeScript, kullanıcı deneyimi');
  const [copied, setCopied] = useState(false);

  const picked = appId === FREE ? undefined : applications.find(a => a.id === appId);
  // Free-form mode: write for any company, school or scholarship without an application record.
  const app: Application = picked ?? {
    id: FREE, companyName: manual.companyName || '[Kurum adı]', position: manual.position || '[Pozisyon / program]',
    contactPerson: manual.contactPerson, city: '', applicationDate: new Date().toISOString(), status: 'Başvuruldu',
    notes: '', createdAt: '', updatedAt: '',
  };
  const generated = app ? buildTemplate(kind, { app, name: preferences.userName, skills, tone, variant }) : null;
  // Edits are kept until any input changes, then the text is regenerated.
  const generatedKey = generated ? generated.subject + generated.body : '';
  const [draft, setDraft] = useState<{ key: string; subject: string; body: string } | null>(null);
  const subject = draft?.key === generatedKey ? draft.subject : generated?.subject ?? '';
  const body = draft?.key === generatedKey ? draft.body : generated?.body ?? '';
  const setSubject = (value: string) => setDraft({ key: generatedKey, subject: value, body });
  const setBody = (value: string) => setDraft({ key: generatedKey, subject, body: value });

  useEffect(() => {
    localStorage.setItem(SKILLS_KEY, skills);
  }, [skills]);

  const copy = async () => {
    await navigator.clipboard.writeText(`${subject}\n\n${body}`);
    setCopied(true);
    toast.success('Panoya kopyalandı! 📋');
    window.setTimeout(() => setCopied(false), 2000);
  };

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const downloadTxt = () => {
    const url = URL.createObjectURL(new Blob([`${subject}\n\n${body}`], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${app.companyName}_${kind}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const words = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Yazı Stüdyosu ✍️</h1>
        <p className="text-ink-soft mt-2">Ön yazı, takip, teşekkür ve teklif e-postalarını saniyeler içinde hazırla; staj, burs ya da iş için.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="studio-app" className="text-sm font-bold text-ink-soft">Kime yazıyoruz?</label>
              <div className="flex items-center gap-3">
                <CompanyAvatar name={picked ? app.companyName : manual.companyName || '✍'} className="h-11 w-11 text-sm" />
                <select
                  id="studio-app"
                  value={picked ? app.id : FREE}
                  onChange={(e) => setAppId(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 glass-input rounded-xl text-ink font-bold appearance-none"
                >
                  <option value={FREE}>✍️ Serbest yazım (bilgileri ben gireceğim)</option>
                  {applications.map(a => <option key={a.id} value={a.id}>{a.companyName} · {a.position}</option>)}
                </select>
              </div>
            </div>

            {!picked && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 animate-fade-in">
                {([['companyName', 'Kurum / şirket'], ['position', 'Pozisyon / program'], ['contactPerson', 'Kişi (isteğe bağlı)']] as const).map(([field, label]) => (
                  <input key={field} value={manual[field]} onChange={(e) => setManual(m => ({ ...m, [field]: e.target.value }))} placeholder={label} aria-label={label}
                    className="px-3 py-2.5 glass-input rounded-xl text-sm text-ink font-medium placeholder:text-ink-muted" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="studio-name" className="text-sm font-bold text-ink-soft">Adın</label>
                <input
                  id="studio-name"
                  value={preferences.userName}
                  onChange={(e) => updatePreferences({ userName: e.target.value })}
                  placeholder="Adın Soyadın"
                  className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium placeholder:text-ink-muted"
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-bold text-ink-soft">Ton</span>
                <div className="flex p-1 bg-glass/40 border border-glass/60 rounded-xl">
                  {([['formal', '👔 Resmî'], ['warm', '🌻 Samimi']] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTone(key)}
                      className={cn('flex-1 py-2 rounded-lg text-xs font-bold transition-all', tone === key ? 'bg-glass/80 text-moss shadow-sm' : 'text-ink-soft')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="studio-skills" className="text-sm font-bold text-ink-soft">Öne çıkan yeteneklerin <span className="text-ink-muted font-semibold">(virgülle ayır)</span></label>
              <input
                id="studio-skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            {TEMPLATE_KINDS.map(t => (
              <button
                key={t.id}
                onClick={() => { setKind(t.id); setVariant(0); }}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all',
                  kind === t.id
                    ? 'bg-moss/10 border-moss/40 shadow-md'
                    : 'bg-glass/40 border-glass/60 hover:bg-glass/60'
                )}
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="min-w-0">
                  <span className={cn('block font-bold', kind === t.id ? 'text-moss' : 'text-ink')}>{t.label}</span>
                  <span className="block text-xs font-semibold text-ink-muted">{t.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Output: a paper-like letter */}
        <div className="lg:col-span-3 glass-panel p-0 overflow-hidden flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-glass/60 bg-glass/30">
            <span className="text-xs font-bold text-ink-muted">{words} kelime · ~{Math.max(1, Math.round(words / 200))} dk okuma</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setVariant(v => v + 1)} className="btn-ghost px-3 py-2 text-xs" title="Farklı bir versiyon üret">
                <Shuffle className="w-3.5 h-3.5 mr-1.5" /> Karıştır
              </button>
              <button onClick={downloadTxt} className="btn-ghost px-3 py-2 text-xs">
                <Download className="w-3.5 h-3.5 mr-1.5" /> İndir
              </button>
              <a href={mailto} className="btn-ghost px-3 py-2 text-xs">
                <Mail className="w-3.5 h-3.5 mr-1.5" /> E-posta
              </a>
              <button onClick={copy} className="btn-primary px-3 py-2 text-xs shadow-md">
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>
          <div className="flex-1 p-5 sm:p-8 bg-[#fdfbf7]/70 dark:bg-[#1f1813]/60">
            <label className="block text-[10px] font-black uppercase tracking-widest text-ink-muted mb-1">Konu</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-transparent font-serif font-bold text-lg text-ink outline-none border-b border-dashed border-sand pb-2 mb-5"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={18}
              className="w-full bg-transparent font-serif text-[15px] leading-7 text-ink outline-none resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
