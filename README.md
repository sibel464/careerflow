# Sibilia 🌿📚

Kişisel gelişimini takip ettiğin, gerçek nesnelere benzeyen sıcak bir çalışma alanı: defterler, mantar pano, saksı bitkileri, odak masası ve bohem duvar kâğıtları.

**Canlı site:** https://sibilia-psi.vercel.app

## Özellikler

- **Çalışma alanı:** dersler, görevler, ders programı, takvim, notlar, defterler, kitaplık, bilgi kartları ve hedefler
- **Odak odası:** zamanlayıcı ve ortam sesleri
- **Bahçe ve orman:** çalıştıkça büyüyen bitkiler ve ağaçlar
- **Günlük:** yazma, çizim ve ruh hâli takibi; zaman kapsülü
- **Alışkanlıklar ve ödüller:** alışkanlık kavanozu, cüzdan ve başarımlar
- **Sohbet:** WhatsApp benzeri mesajlaşma ve ilerleme kartı paylaşımı (Supabase)
- **Kariyer takibi:** başvurular, kanban, analizler ve mülakat hazırlığı
- **Kişiselleştirme:** temalar, dekor, avatar ve evcil hayvan
- **Android uygulaması:** canlı siteyi açan Capacitor uygulaması (`android/`)

## Teknolojiler

React 19 · TypeScript · Vite · Tailwind CSS · React Router · Recharts · Supabase · Capacitor · Vercel

## Kurulum

```bash
npm install
cp .env.example .env.local   # Supabase bilgilerini doldur (veya: vercel env pull)
npm run dev
```

Kayıt olma (`api/signup.ts`) bir Vercel fonksiyonudur. Yerelde çalışması için `npm run dev` yerine `vercel dev` kullan.

Veritabanı şeması: `supabase/schema.sql`

## Android

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```
