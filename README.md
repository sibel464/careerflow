# CareerFlow - Bohem Kariyer Asistanı 🌿☕

CareerFlow, iş başvuru süreçlerinizi kolayca takip etmenizi sağlayan, motive edici detaylar ve modern web teknolojileriyle geliştirilmiş şık bir "Kariyer Asistanı" projesidir. Glassmorphism (Buzlu Cam) tasarımı ve bohem renk paleti kullanılarak kullanıcılara huzurlu bir deneyim sunmayı amaçlar.

Eğitim programı web geliştirme proje isterleri doğrultusunda **ReactJS** kullanılarak sıfırdan geliştirilmiştir.

## 🌟 Öne Çıkan Özellikler

- **Tam CRUD İşlemleri:** Yeni başvuru ekleme, listeleme, detayları güncelleme ve silme.
- **Kalıcı Veri (LocalStorage):** Tüm veriler tarayıcınızın hafızasında tutulur, sayfayı yenilediğinizde kaybolmaz.
- **Bohem & Glassmorphism Tasarım:** Tailwind CSS kullanılarak modern ve ferah bir arayüz.
- **Analizler ve Grafikler:** Başvurularınızın durumunu, şehir dağılımını ve başvuru zaman çizelgesini grafiklerle (Recharts) görüntüleme.
- **Gelişmiş Başvuru Takibi:** Çalışma modeli, şirket puanlama, İK iletişim kişisi ve CV linki gibi detaylı form alanları.
- **Görev Yönetimi (To-Do):** Her başvuru için özel "yapılacaklar" listesi oluşturma.
- **Mülakat Hazırlığı:** İK sorularına önceden çalışıp notlar alabileceğiniz hazırlık sayfası.
- **Bohem Radyo:** Çalışırken odaklanmanızı sağlayacak gömülü Lofi müzik çalar.

## 🛠️ Kullanılan Teknolojiler

- **Kütüphane:** ReactJS (TypeScript ile)
- **Stil & Arayüz:** Tailwind CSS & Özel CSS (Glassmorphism)
- **Veri Saklama:** Tarayıcı `localStorage`
- **İkonlar:** Lucide React
- **Grafikler:** Recharts
- **Router:** React Router v6
- **Paketleyici:** Vite

## 📁 Proje Dosya Yapısı

Proje, eğitim isterlerinde belirtildiği gibi modüler bir ağaç yapısına sahiptir:

```text
src/
├── Components/    # Tekrar kullanılabilir UI parçaları (Card, Table, Modal vb.)
├── Pages/         # Ana ekran bileşenleri (Dashboard, Applications, Analytics vb.)
├── Interfaces/    # TypeScript tip tanımlamaları (Veri modelleri)
├── Hooks/         # Context API ve Custom Hook'lar
├── Utils/         # Yardımcı fonksiyonlar
├── App.tsx        # Ana Router (Yönlendirme) yapısı
└── index.css      # Animasyonlar ve Tailwind yapılandırması
```

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Projeyi bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/careerflow.git
   ```

2. Proje dizinine gidin:
   ```bash
   cd careerflow
   ```

3. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

5. Tarayıcınızda `http://localhost:5173` adresine giderek projeyi görüntüleyin.

## 📌 Proje İsterlerinin Karşılanması

Bu proje, Web Geliştirme eğitim programı projesi yönergelerine uygun olarak hazırlanmıştır:
- [x] Modern JS Kütüphanesi (ReactJS) kullanılmıştır.
- [x] LocalStorage kullanılarak veri kalıcılığı sağlanmıştır.
- [x] Components, Pages ve Interfaces klasör mimarisi kurulmuştur.
- [x] Tailwind CSS kullanılmıştır.
- [x] Başvuru Ekleme, Listeleme, Güncelleme ve Silme (CRUD) işlemleri eksiksiz çalışmaktadır.

---
*Sevgi ve kahve eşliğinde geliştirildi.* ☕✨
