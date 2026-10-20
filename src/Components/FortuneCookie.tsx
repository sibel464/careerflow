import React, { useState } from 'react';
import { format } from 'date-fns';
import { useLocalStorage } from '../Hooks/useLocalStorage';

const FORTUNES = [
  'Bugün küçük bir cesaret, büyük bir kapı açacak.',
  'Biri seni düşünüyor ve gülümsüyor. 💛',
  'Beklediğin mesaj sandığından erken gelecek.',
  'Ertelediğin o işi bugün 10 dakikalığına başlat; gerisi gelir.',
  'Bir fincan çay, bugün iyi bir fikrin başlangıcı olacak.',
  'Yorgunsan dinlen; vazgeçme. Yarın daha güçlü uyanacaksın.',
  'Bugün birine iltifat et, sana katlanarak dönecek.',
  'Sınavlar geçer, öğrendiklerin kalır. Bugün bir sayfa daha.',
  'Pencereden bakmayı unutma; gökyüzü bugün sana göz kırpıyor.',
  'Şans, hazırlıkla fırsatın buluştuğu andır. Hazırlanıyorsun.',
  'Bugün kendine "aferin" demek için harika bir gün.',
  'Kaybolduğunu sandığın şey, bugün karşına çıkabilir.',
  'Bir yürüyüş, kafandaki düğümü çözecek.',
  'Küçük adımlar da yol alır. Bugün bir adım yeter.',
  'Gülüşün bugün birinin gününü kurtaracak.',
  'Merak ettiğin o soruyu sor; cevap seni şaşırtacak.',
  'Bugün aldığın not, yarın tam ihtiyacın olduğunda işine yarayacak.',
  'Sevdiğin bir şarkı bugün tam zamanında çalacak.',
  'Biraz düzen, çok huzur getirir. Masanı topla, kafan da toplanır.',
  'Hayal ettiğin şeye bugün bir adım daha yaklaştın.',
  'Kendine nazik ol; bugün buna ihtiyacın var.',
  'Beklenmedik bir yerden güzel bir haber geliyor.',
  'Bugün bir şeyi ilk kez dene. Küçük olsun, yeter.',
  'Su iç, nefes al, devam et. Çok iyi gidiyorsun.',
  'Bir arkadaşına mesaj at; o da seni özlemiş.',
  'Bugünkü emeğin, gelecekteki senin teşekkür sebebi.',
  'Mükemmel değil, istikrarlı. Bugün de oradasın.',
  'Akşam güzel bir sürpriz seni bekliyor olabilir.',
];

/** Same fortune all day; a new cookie tomorrow. */
const pick = (day: string) => {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const FortuneCookie: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [opened, setOpened] = useLocalStorage<string>('careerflow_fortune_opened', '');
  const [cracking, setCracking] = useState(false);
  const isOpen = opened === today;
  const h = pick(today);
  const fortune = FORTUNES[h % FORTUNES.length];
  const lucky = Array.from(new Set([7, 13, 29, 41, 53].map(m => ((h * m + m * m) % 49) + 1))).slice(0, 3).sort((a, b) => a - b);

  const crack = () => {
    if (isOpen || cracking) return;
    setCracking(true);
    window.setTimeout(() => { setOpened(today); setCracking(false); }, 700);
  };

  return (
    <div className="glass-panel p-5 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
      <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted self-start">Şans kurabiyesi</p>
      {!isOpen ? (
        <button onClick={crack} className="group relative mt-3 mb-2 w-36 h-28" aria-label="Kurabiyeyi kır">
          <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[84px] leading-none drop-shadow-lg transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105 ${cracking ? 'cookie-crack' : 'animate-float'}`}>🥠</span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-ink-muted whitespace-nowrap">{cracking ? 'çat!' : 'kırmak için dokun'}</span>
        </button>
      ) : (
        <div className="mt-3 w-full">
          <div className="fortune-slip relative mx-auto px-4 py-3 bg-[#fffdf7] text-[#5a2a24] shadow-md">
            <p className="font-serif italic text-[15px] leading-snug">“{fortune}”</p>
            <p className="mt-2 text-[10px] font-black tracking-widest opacity-70">ŞANSLI SAYILAR · {lucky.join(' · ')}</p>
          </div>
          <p className="text-[11px] font-semibold text-ink-muted mt-3">Yarın yeni bir kurabiye seni bekliyor 🥠</p>
        </div>
      )}
    </div>
  );
};
