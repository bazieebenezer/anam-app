import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'anam-app',
  webDir: 'www',
  plugins: {
    Media: {
      androidGalleryMode: false,
    },
  },
};

export default config;
