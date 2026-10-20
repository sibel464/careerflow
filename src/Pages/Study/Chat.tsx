import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { emailFor, supabase } from '../../Utils/supabase';
import { USERNAME_RE } from '../../Utils/chat';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { Messenger } from '../../Components/Chat/Messenger';
import { cn } from '../../Utils/classNames';

/** Turkish letters and spaces are fine to type — they become a valid handle (Şule Ç. → sule_c.). */
const toUsername = (v: string) => v.toLocaleLowerCase('tr')
  .replace(/[çğıöşü]/g, c => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c] ?? c)
  .replace(/\s+/g, '_').replace(/[^a-z0-9_.@]/g, '').slice(0, 21);

const AVATARS = ['🦊', '🐱', '🐼', '🐸', '🦉', '🐰', '🐻', '🦄', '🐧', '🐨', '🌸', '🌙'];

/** Shown until the Supabase keys are in .env.local. */
const ChatSetup: React.FC = () => (
  <div className="max-w-2xl mx-auto glass-panel p-6 sm:p-8 space-y-3">
    <h1 className="text-3xl font-extrabold font-serif text-ink">Sohbet 💬</h1>
    <p className="text-ink-soft">Sohbet sunucusunun anahtarları bulunamadı. Proje klasöründe <code className="px-1 rounded bg-glass/60">vercel env pull .env.local</code> çalıştırıp uygulamayı yeniden başlat.</p>
  </div>
);

const ChatAuth: React.FC = () => {
  const sb = supabase!;
  const { preferences } = usePreferences();
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(preferences.userName);
  const [avatar, setAvatar] = useState(AVATARS.includes(preferences.avatar) ? preferences.avatar : AVATARS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = username.replace(/^@/, '');
    if (!USERNAME_RE.test(name)) return setError('Kullanıcı adı 3-20 karakter olmalı: küçük harf, rakam, _ ve . kullanabilirsin.');
    if (password.length < 6) return setError('Şifre en az 6 karakter olmalı.');
    setBusy(true);
    if (mode === 'up') {
      const res = await fetch('/api/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password, display_name: displayName, avatar }),
      }).catch(() => null);
      if (!res?.ok) {
        const code = res ? (await res.json().catch(() => ({}))).error : null;
        setBusy(false);
        return setError(code === 'taken' ? 'Bu kullanıcı adı alınmış, başka bir tane dene.' : 'Kayıt olunamadı, birazdan tekrar dene.');
      }
    }
    const { error: signInError } = await sb.auth.signInWithPassword({ email: emailFor(name), password });
    if (signInError) setError('Kullanıcı adı ya da şifre hatalı.');
    setBusy(false);
  };

  return (
    <div className="max-w-md mx-auto glass-panel p-6 sm:p-8">
      <p className="text-5xl text-center">💬</p>
      <h1 className="text-3xl font-extrabold font-serif text-ink text-center mt-2">Sohbet</h1>
      <p className="text-ink-soft text-center text-sm mt-1">Arkadaşlarınla yazış, ilerlemeni paylaş.</p>

      <div className="grid grid-cols-2 p-1 mt-6 rounded-2xl bg-glass/40 border border-glass/60">
        {(['up', 'in'] as const).map(m => (
          <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
            className={cn('py-2 text-sm font-black rounded-xl transition-colors', mode === m ? 'bg-moss text-white shadow' : 'text-ink-soft')}>
            {m === 'up' ? 'Kayıt ol' : 'Giriş yap'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3 mt-5">
        {mode === 'up' && (
          <>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {AVATARS.map(a => (
                <button type="button" key={a} onClick={() => setAvatar(a)} aria-label={`Avatar ${a}`}
                  className={cn('w-10 h-10 rounded-full text-xl transition-transform', avatar === a ? 'bg-moss/15 ring-2 ring-moss scale-110' : 'hover:bg-glass/60')}>{a}</button>
              ))}
            </div>
            <input value={displayName} onChange={e => setDisplayName(e.target.value.slice(0, 40))} placeholder="Adın (arkadaşların böyle görür)" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
          </>
        )}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-bold">@</span>
          <input value={username} onChange={e => setUsername(toUsername(e.target.value))} placeholder="kullanici_adi" autoCapitalize="none" autoComplete="username"
            className="w-full pl-9 pr-4 py-3 glass-input rounded-xl text-ink font-bold" />
        </div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre (en az 6 karakter)"
          autoComplete={mode === 'up' ? 'new-password' : 'current-password'} className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
        {error && <p className="text-sm font-bold text-clay">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3 disabled:opacity-60">{busy ? '…' : mode === 'up' ? 'Hesap oluştur' : 'Giriş yap'}</button>
      </form>
    </div>
  );
};

export const Chat: React.FC = () => {
  const [session, setSession] = useState<Session | null | undefined>(supabase ? undefined : null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) return <ChatSetup />;
  if (session === undefined) return <div className="flex justify-center py-24 text-4xl animate-bounce">💬</div>;
  if (!session) return <ChatAuth />;
  return <Messenger key={session.user.id} meId={session.user.id} />;
};
