import { Application } from '../Interfaces';

const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escape = (text: string) => text.replace(/[\\,;]/g, m => `\\${m}`).replace(/\n/g, '\\n');

/** Downloads an .ics file so the interview lands in Google/Apple/Outlook calendars. */
export function downloadInterviewIcs(app: Application, durationMinutes = 60) {
  if (!app.interviewDate) return;
  const start = new Date(app.interviewDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const stage = app.interviewStage && app.interviewStage !== 'Henüz Yok' ? app.interviewStage : 'Mülakat';
  const description = [
    `Pozisyon: ${app.position}`,
    app.contactPerson && `İletişim: ${app.contactPerson}`,
    app.jobUrl && `İlan: ${app.jobUrl}`,
    'CareerFlow ile planlandı 🌿',
  ].filter(Boolean).join('\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CareerFlow//TR',
    'BEGIN:VEVENT',
    `UID:${app.id}-${stamp(start)}@careerflow`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(`${app.companyName} · ${stage}`)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(app.workModel === 'Uzaktan 🏠' ? 'Online' : app.city)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Mülakatın 30 dakika sonra başlıyor!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${app.companyName.replace(/\s+/g, '_')}_mulakat.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Opens Google Calendar's "new event" page pre-filled with the interview. */
export function googleCalendarUrl(app: Application, durationMinutes = 60) {
  if (!app.interviewDate) return '#';
  const start = new Date(app.interviewDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${app.companyName} · Mülakat`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `Pozisyon: ${app.position}${app.contactPerson ? `\nİletişim: ${app.contactPerson}` : ''}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
