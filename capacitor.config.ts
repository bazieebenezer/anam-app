import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Météo Burkina',
  webDir: 'www',
  plugins: {
    CapacitorSocialLogin: {
      google: {
        webClientId:
          '248991475042-vnodgbbgaopnuo7u84n1taivhealhcks.apps.googleusercontent.com',
        androidClientId:
          '248991475042-ceha2np47f4keq248bjhch6kra28j5c9.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        forceCodeForRefreshToken: true,
      },
    },
  },
};

export default config;
