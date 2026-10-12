import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { BASE } from "@/lib/base";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momo",
  description: "Your little bunny who cares. · เพื่อนตัวเล็กที่คอยดูแลแพรวา",
  applicationName: "Momo",
  appleWebApp: { capable: true, title: "Momo", statusBarStyle: "default" },
  icons: { icon: `${BASE}/icons/icon-192.png`, apple: `${BASE}/icons/apple-touch-icon.png` },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFF8F2",
};

// Sets data-theme before first paint so dark mode doesn't flash.
const themeBoot = `try{var p=localStorage.getItem("momo:themePref")||"time",h=new Date().getHours(),t=p==="time"?(h>=18||h<6?"dark":"light"):p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
