import type { CapacitorConfig } from "@capacitor/cli";

// iOS app shell around the same static export the PWA uses (out/).
const config: CapacitorConfig = {
  appId: "app.momo.reminder",
  appName: "Momo",
  webDir: "out",
  backgroundColor: "#FFF8F2",
  ios: {
    contentInset: "never", // the web layout already pads with env(safe-area-inset-*)
    scheme: "Momo",
  },
  plugins: {
    LocalNotifications: {
      iconColor: "#C4466F",
    },
  },
};

export default config;
