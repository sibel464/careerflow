import { Application } from '../Interfaces';

export type TemplateKind = 'cover' | 'followup' | 'thanks' | 'negotiate' | 'decline';
export type Tone = 'formal' | 'warm';

export interface TemplateInput {
  app: Application;
  name: string;
  skills: string;
  tone: Tone;
  variant: number;
}

export const TEMPLATE_KINDS: { id: TemplateKind; label: string; emoji: string; hint: string }[] = [
  { id: 'cover', label: 'Ön Yazı', emoji: '💌', hint: 'Başvuruna eşlik eden etkileyici bir giriş.' },
  { id: 'followup', label: 'Takip Maili', emoji: '📬', hint: 'Bir haftadır ses yoksa kibarca hatırlat.' },
  { id: 'thanks', label: 'Teşekkür Maili', emoji: '🙏', hint: 'Mülakattan sonraki 24 saat içinde gönder.' },
  { id: 'negotiate', label: 'Teklif Müzakeresi', emoji: '🤝', hint: 'Teklifi nazikçe iyileştirmeyi dene.' },
  { id: 'decline', label: 'Kibar Ret', emoji: '🍃', hint: 'Köprüleri yakmadan teklifi geri çevir.' },
];

const pick = <T,>(options: T[], variant: number) => options[variant % options.length];

export function buildTemplate(kind: TemplateKind, { app, name, skills, tone, variant }: TemplateInput) {
  const formal = tone === 'formal';
  const contact = app.contactPerson?.trim();
  const greeting = contact
    ? (formal ? `Sayın ${contact},` : `Merhaba ${contact.split(' ')[0]},`)
    : (formal ? `Sayın ${app.companyName} İşe Alım Ekibi,` : `Merhaba ${app.companyName} ekibi,`);
  const signoff = formal ? `Saygılarımla,\n${name || '[Adın Soyadın]'}` : `Sevgiler,\n${name || '[Adın]'}`;
  const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
  const skillText = skillList.length
    ? skillList.length === 1 ? skillList[0] : `${skillList.slice(0, -1).join(', ')} ve ${skillList[skillList.length - 1]}`
    : '[öne çıkan yeteneklerin]';
  const industry = app.companyIndustry ? `${app.companyIndustry} alanındaki` : 'sektördeki';
  const STAGE_TEXT: Record<string, string> = {
    'İK Görüşmesi 🗣️': 'İK görüşmesi',
    'Teknik Mülakat 💻': 'teknik mülakat',
    'Yönetici Görüşmesi 🤝': 'yönetici görüşmesi',
  };
  const stage = (app.interviewStage && STAGE_TEXT[app.interviewStage]) || 'görüşme';

  switch (kind) {
    case 'cover':
      return {
        subject: `${app.position} Pozisyonu Başvurusu – ${name || '[Adın]'}`,
        body: [
          greeting,
          '',
          pick([
            `${app.companyName} bünyesindeki ${app.position} pozisyonu için başvurumu iletmekten mutluluk duyuyorum.`,
            `${app.companyName}'ın ${industry} vizyonunu uzun süredir yakından takip ediyorum ve ${app.position} ilanını görünce heyecanlandım.`,
            `${app.position} rolü, hem yeteneklerimle hem de kariyer hedeflerimle birebir örtüştüğü için ${app.companyName} ekibine katılma isteğimi paylaşmak istedim.`,
          ], variant),
          '',
          `Özellikle ${skillText} konularındaki deneyimimle ekibinize hızlıca değer katabileceğime inanıyorum. ` +
          pick([
            'Karmaşık problemleri sade ve kullanıcı odaklı çözümlere dönüştürmekten keyif alıyorum.',
            'Öğrenmeye açık yapım ve takım çalışmasına verdiğim önemle, ortak hedeflere ulaşmak için elimi taşın altına koyarım.',
            'Ürettiğim işin gerçek insanların hayatına dokunduğunu görmek beni en çok motive eden şey.',
          ], variant + 1),
          '',
          formal
            ? 'Özgeçmişimi ekte bilgilerinize sunarım. Uygun bir zamanda görüşme fırsatı bulabilirsek çok memnun olurum.'
            : 'Özgeçmişimi ekledim; tanışıp neler yapabileceğimizi konuşmayı çok isterim!',
          '',
          signoff,
        ].join('\n'),
      };

    case 'followup':
      return {
        subject: `${app.position} Başvurum Hakkında`,
        body: [
          greeting,
          '',
          pick([
            `Birkaç gün önce ${app.position} pozisyonu için başvuru yapmıştım. Başvurumun değerlendirme süreci hakkında bilgi alabilir miyim?`,
            `${app.position} pozisyonuna yaptığım başvurunun ardından kısa bir hatırlatma yapmak istedim.`,
          ], variant),
          '',
          `${app.companyName} ekibinin bir parçası olma konusundaki heyecanım hâlâ çok taze. ${skillText} alanlarındaki deneyimimin pozisyon için iyi bir eşleşme olacağını düşünüyorum.`,
          '',
          formal ? 'Ek bilgi ya da belge ihtiyacınız olursa memnuniyetle iletirim. Zaman ayırdığınız için teşekkür ederim.' : 'Ek bir şeye ihtiyacınız olursa hemen gönderirim. Şimdiden teşekkürler!',
          '',
          signoff,
        ].join('\n'),
      };

    case 'thanks':
      return {
        subject: `Görüşmemiz İçin Teşekkürler – ${app.position}`,
        body: [
          greeting,
          '',
          pick([
            `Bugünkü ${stage} için zaman ayırdığınız için çok teşekkür ederim.`,
            `Bugün gerçekleştirdiğimiz keyifli ${stage} için teşekkür etmek istedim.`,
          ], variant),
          '',
          `Konuşmamız, ${app.companyName}'daki ${app.position} rolüne olan ilgimi daha da artırdı. Ekibin çalışma biçimini ve önündeki hedefleri dinlemek, ${skillText} alanlarındaki birikimimle nasıl katkı sağlayabileceğimi daha net görmemi sağladı.`,
          '',
          formal ? 'Süreçle ilgili gelişmeleri sabırsızlıkla bekliyorum.' : 'Bir sonraki adımı heyecanla bekliyorum! 🌿',
          '',
          signoff,
        ].join('\n'),
      };

    case 'negotiate':
      return {
        subject: `${app.position} Teklifi Hakkında`,
        body: [
          greeting,
          '',
          `${app.position} pozisyonu için ilettiğiniz teklif için çok teşekkür ederim; ${app.companyName} ekibine katılma fikri beni gerçekten heyecanlandırıyor.`,
          '',
          `Teklifi detaylıca değerlendirdim. Piyasa araştırmam ve ${skillText} alanlarındaki deneyimim doğrultusunda, ücret paketinin ${app.salaryExpectation || '[hedef rakam]'} seviyesine yaklaşması mümkün olur mu? Esnek çalışma, eğitim bütçesi gibi yan haklar konusunda da konuşmaya açığım.`,
          '',
          formal ? 'Her iki taraf için de uygun bir noktada buluşabileceğimize inanıyorum.' : 'İkimiz için de güzel bir orta nokta bulabileceğimize eminim!',
          '',
          signoff,
        ].join('\n'),
      };

    case 'decline':
      return {
        subject: `${app.position} Teklifi Hakkında`,
        body: [
          greeting,
          '',
          `${app.position} pozisyonu için bana gösterdiğiniz ilgi ve ilettiğiniz teklif için içtenlikle teşekkür ederim.`,
          '',
          'Uzun bir değerlendirmenin ardından, kariyer hedeflerim doğrultusunda farklı bir yönde ilerlemeye karar verdim. Bu kararı vermek kolay olmadı; süreç boyunca tanıştığım herkesin samimiyetinden çok etkilendim.',
          '',
          `${app.companyName} ile yollarımızın gelecekte yeniden kesişmesini umuyorum.`,
          '',
          signoff,
        ].join('\n'),
      };
  }
}
