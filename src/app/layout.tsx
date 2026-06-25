import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DBProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Provisoire — Rwanda Driving Licence Trainer",
  description:
    "Practice and exam simulator for the Rwandan provisional driving licence theory test. 398 official questions, spaced-repetition, image questions and progress tracking.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Provisoire", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#070d1b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DBProvider>{children}</DBProvider>
      </body>
    </html>
  );
}
