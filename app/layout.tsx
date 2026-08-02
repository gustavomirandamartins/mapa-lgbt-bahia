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
  applicationName: "PLATUR-LGBT+ Bahia",
  title: {
    default: "PLATUR-LGBT+ · Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal na Bahia",
    template: "%s · PLATUR-LGBT+ Bahia",
  },
  description:
    "Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal dos 417 municípios da Bahia. Uma tecnologia de gestão social da SETUR-BA.",
  icons: {
    icon: [
      {
        url: "https://rajnaphdzifhxvezhuuh.supabase.co/storage/v1/object/public/icons/icon.png",
        type: "image/png",
      },
    ],
    shortcut: [
      "https://rajnaphdzifhxvezhuuh.supabase.co/storage/v1/object/public/icons/icon.png",
    ],
    apple: [
      {
        url: "https://rajnaphdzifhxvezhuuh.supabase.co/storage/v1/object/public/icons/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PLATUR-LGBT+",
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
