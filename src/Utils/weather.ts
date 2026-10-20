/** Live weather from the Turkish Met Service (MGM, via /api/weather), falling back to Open-Meteo. Cached for 30 minutes. */
export const WEATHER_KEYS = { city: 'careerflow_weather_city_v2', cache: 'careerflow_weather_cache_v3' } as const;

export type Sky = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

export interface Weather {
  city: string;
  temp: number;
  max: number;
  min: number;
  rainChance: number;
  wind: number;
  code: number;
  sky: Sky;
  fetchedAt: number;
  /** Where the numbers came from. */
  source?: 'MGM' | 'Open-Meteo';
  /** MGM's own description, e.g. "Gökgürültülü sağanak". */
  label?: string;
  district?: string | null;
  humidity?: number | null;
  feelsLike?: number | null;
  /** Every 3 hours from now (MGM only). */
  hourly?: { time: string; temp: number; humidity: number; wind: number; hadise: string; label: string; sky: Sky }[];
  /** The next five days (MGM only). */
  days?: { date: string; max: number; min: number; hadise: string; label: string; sky: Sky }[];
}

export const skyFor = (code: number): Sky => {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloudy';
};

export const SKY_LABEL: Record<Sky, string> = {
  clear: 'Açık', partly: 'Parçalı bulutlu', cloudy: 'Bulutlu', fog: 'Sisli', drizzle: 'Çiseliyor', rain: 'Yağmurlu', snow: 'Karlı', storm: 'Fırtınalı',
};

/** A friendly, practical tip for going out today. */
export const adviceFor = (w: Weather) => {
  if (w.sky === 'storm') return 'Fırtına var, mümkünse içeride kal ⛈️';
  if (w.sky === 'snow') return 'Atkı, bere, eldiven! Yollar kaygan olabilir ❄️';
  if (w.sky === 'rain' || w.sky === 'drizzle' || w.rainChance >= 60) return 'Şemsiyeni almayı unutma ☔';
  if (w.max >= 30) return 'Güneş kremi ve bol su 🧴💧';
  if (w.min <= 5) return 'Sıkı giyin, hava soğuk 🧣';
  if (w.wind >= 35) return 'Rüzgârlı, saçlarını topla 🌬️';
  if (w.sky === 'clear' && w.max >= 18) return 'Dışarıda ders çalışmalık hava ☀️📚';
  return 'Hafif bir hırka yeter 🧥';
};

export type DayPart = 'night' | 'dawn' | 'day' | 'dusk';
export const dayPartOf = (d = new Date()): DayPart => {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h < 5.5 || h >= 21) return 'night';
  if (h < 8) return 'dawn';
  if (h < 17.5) return 'day';
  return 'dusk';
};

/** The official Turkish Meteorological Service, through our small server proxy. */
async function fetchMgm(city: string): Promise<Weather> {
  const res = await fetch(`/api/weather?il=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error('MGM');
  const w = await res.json();
  if (typeof w?.temp !== 'number') throw new Error('MGM');
  return w as Weather;
}

export async function fetchWeather(city: string): Promise<Weather> {
  try {
    return await fetchMgm(city);
  } catch {
    return fetchOpenMeteo(city);
  }
}

async function fetchOpenMeteo(city: string): Promise<Weather> {
  const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`).then(r => r.json());
  const place = geo?.results?.[0];
  if (!place) throw new Error('Şehir bulunamadı');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}`
    + '&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=1&timezone=auto';
  const data = await fetch(url).then(r => r.json());
  const code = Number(data.current?.weather_code ?? 0);
  return {
    city: place.name,
    temp: Math.round(data.current?.temperature_2m ?? 0),
    max: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
    min: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
    rainChance: Number(data.daily?.precipitation_probability_max?.[0] ?? 0),
    wind: Math.round(data.current?.wind_speed_10m ?? 0),
    code,
    sky: skyFor(code),
    fetchedAt: Date.now(),
    source: 'Open-Meteo',
  };
}
