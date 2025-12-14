
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.housetax.admin2026',
  appName: 'House Tax 2026',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Basic keyboard configuration for mobile inputs
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  }
};

export default config;
