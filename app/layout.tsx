import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "IDT-LGBT Bahia",
  title: {
    default: "IDT-LGBT · Mapa do Turismo LGBTQIAPN+ na Bahia",
    template: "%s · IDT-LGBT Bahia",
  },
  description:
    "Mapa interativo do Índice de Desenvolvimento do Turismo LGBTQIAPN+ (IDT-LGBT) dos 417 municípios da Bahia. Uma tecnologia de gestão social da SETUR-BA.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IDT Bahia",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f2f2f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
