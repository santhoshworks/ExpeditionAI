import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.expeditionai.app',
  appName: 'ExpeditionAI',
  webDir: 'out',
  server: {
    // Use live reload during development
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined,
    cleartext: process.env.NODE_ENV === 'development',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#f8fafc',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#f8fafc',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    scheme: 'ExpeditionAI',
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
  },
}

export default config
