
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'your.app.id',
  appName: 'Your App Name',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Keyboard: {
      resize: 'ionic',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;