import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agroco.app',
  appName: 'AgroCo',
  webDir: 'dist/agroco-frontend/browser',
  bundledWebRuntime: false,
  server: {
    // Si tu backend es HTTP (no HTTPS), puedes forzar esquema http en Android
    androidScheme: 'http',
  },
};

export default config;


