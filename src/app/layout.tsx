import type { Metadata, Viewport } from "next";
import {
  DM_Sans,
  DM_Serif_Display,
  Inter,
  Geist,
  Geist_Mono,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Sora,
  IBM_Plex_Mono,
  Nunito,
  Lora,
  Comfortaa,
} from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Élev — Fitness Tracker",
  description: "Suivi entraînements, nutrition et poids",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Élev",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#dce8d8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} ${inter.variable} ${geist.variable} ${geistMono.variable} ${plusJakarta.variable} ${playfair.variable} ${sora.variable} ${ibmPlexMono.variable} ${nunito.variable} ${lora.variable} ${comfortaa.variable}`}
    >
      <head>
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}
        />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}
        />
      </head>
      <body className="min-h-dvh flex items-start justify-center">
        <div className="relative w-full max-w-[430px] min-h-dvh overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
