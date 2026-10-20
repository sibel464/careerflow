import type { CapacitorConfig } from '@capacitor/cli';

/**
 * The Android app opens the live site, so chat, MGM weather and sign-up work exactly as on the web,
 * and every deploy updates the app too.
 */
const config: CapacitorConfig = {
  appId: 'app.sibilia.study',
  appName: 'Sibilia',
  webDir: 'dist',
  server: {
    url: 'https://sibilia-psi.vercel.app/study',
    cleartext: false,
  },
  android: {
    backgroundColor: '#efe4d2',
  },
};

export default config;
