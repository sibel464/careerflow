/// <reference types="node" />

/**
 * Live weather from the Turkish State Meteorological Service (MGM, mgm.gov.tr).
 * MGM only answers requests that come from its own site, so the browser asks us and we ask MGM.
 */
const MGM = 'https://servis.mgm.gov.tr/web';
const HEADERS = { Origin: 'https://www.mgm.gov.tr', Referer: 'https://www.mgm.gov.tr/', 'User-Agent': 'Mozilla/5.0 Sibilia' };

const get = async (path: string) => {
  const res = await fetch(`${MGM}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`MGM ${res.status}`);
  return res.json();
};

/** MGM weather phenomenon codes → Turkish label and our sky type. */
const HADISE: Record<string, [string, string]> = {
  A: ['Açık', 'clear'], AB: ['Az bulutlu', 'partly'], PB: ['Parçalı bulutlu', 'partly'], CB: ['Çok bulutlu', 'cloudy'],
  HY: ['Hafif yağmurlu', 'drizzle'], Y: ['Yağmurlu', 'rain'], KY: ['Kuvvetli yağmurlu', 'rain'],
  KKY: ['Karla karışık yağmurlu', 'snow'], HKY: ['Hafif kar yağışlı', 'snow'], K: ['Kar yağışlı', 'snow'], YKY: ['Yoğun kar yağışlı', 'snow'],
  HSY: ['Hafif sağanak yağışlı', 'drizzle'], SY: ['Sağanak yağışlı', 'rain'], KSY: ['Kuvvetli sağanak', 'rain'], MSY: ['Mevzi sağanak', 'rain'],
  DY: ['Dolu', 'storm'], GSY: ['Gökgürültülü sağanak', 'storm'], KGY: ['Kuvvetli gökgürültülü sağanak', 'storm'],
  SIS: ['Sisli', 'fog'], PUS: ['Puslu', 'fog'], DMN: ['Dumanlı', 'fog'], KF: ['Toz/kum fırtınası', 'storm'],
  R: ['Rüzgârlı', 'cloudy'], GKR: ['Güneyli kuvvetli rüzgâr', 'cloudy'], KKR: ['Kuzeyli kuvvetli rüzgâr', 'cloudy'], SCK: ['Sıcak', 'clear'], SGK: ['Soğuk', 'clear'],
};
const RAINY = new Set(['HY', 'Y', 'KY', 'KKY', 'HSY', 'SY', 'KSY', 'MSY', 'GSY', 'KGY', 'DY']);

export async function GET(request: Request) {
  const il = new URL(request.url).searchParams.get('il')?.trim() || 'Samsun';
  try {
    const centers = await get(`/merkezler?il=${encodeURIComponent(il)}`);
    const center = Array.isArray(centers) ? (centers.find((c: { oncelik?: number }) => c.oncelik === 1) ?? centers[0]) : null;
    if (!center) return Response.json({ error: 'not_found' }, { status: 404 });

    const [[now], [daily], hourlyRaw] = await Promise.all([
      get(`/sondurumlar?merkezid=${center.merkezId}`),
      get(`/tahminler/gunluk?istno=${center.gunlukTahminIstNo}`),
      get(`/tahminler/saatlik?istno=${center.saatlikTahminIstNo}`).catch(() => []),
    ]);
    const describe = (h: string) => { const [l, k] = HADISE[h] ?? ['Bulutlu', 'cloudy']; return { hadise: h, label: l, sky: k }; };
    // Every 3 hours, from now on.
    const hourly = ((hourlyRaw?.[0]?.tahmin ?? []) as { tarih: string; hadise: string; sicaklik: number; nem: number; ruzgarHizi: number }[])
      .filter(t => Date.parse(t.tarih) > Date.now() - 90 * 60 * 1000)
      .slice(0, 8)
      .map(t => ({ time: t.tarih, temp: Math.round(t.sicaklik), humidity: t.nem, wind: Math.round(t.ruzgarHizi), ...describe(t.hadise) }));
    const days = [1, 2, 3, 4, 5]
      .filter(i => daily?.[`tarihGun${i}`])
      .map(i => ({ date: daily[`tarihGun${i}`], max: Math.round(daily[`enYuksekGun${i}`]), min: Math.round(daily[`enDusukGun${i}`]), ...describe(daily[`hadiseGun${i}`]) }));
    const code: string = now?.hadiseKodu && now.hadiseKodu !== '-9999' ? now.hadiseKodu : daily?.hadiseGun0 ?? 'A';
    const [label, sky] = HADISE[code] ?? ['Bulutlu', 'cloudy'];
    const todayCode: string = daily?.hadiseGun0 ?? code;

    const body = {
      city: center.il,
      district: center.ilce ?? null,
      temp: Math.round(now?.sicaklik ?? daily?.enYuksekGun0 ?? 0),
      feelsLike: now?.hissedilenSicaklik != null ? Math.round(now.hissedilenSicaklik) : null,
      max: Math.round(daily?.enYuksekGun0 ?? now?.sicaklik ?? 0),
      min: Math.round(daily?.enDusukGun0 ?? now?.sicaklik ?? 0),
      humidity: now?.nem ?? null,
      wind: Math.round(now?.ruzgarHiz ?? daily?.ruzgarHizGun0 ?? 0),
      rainChance: RAINY.has(todayCode) ? 80 : RAINY.has(code) ? 70 : 10,
      code: 0,
      hadise: code,
      label,
      sky,
      observedAt: now?.veriZamani ?? null,
      source: 'MGM',
      hourly,
      days,
      fetchedAt: Date.now(),
    };
    return Response.json(body, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' } });
  } catch {
    return Response.json({ error: 'mgm_unavailable' }, { status: 502 });
  }
}
