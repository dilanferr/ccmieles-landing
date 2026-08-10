import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LOGO_URL, OG_IMAGE, IGLESIA } from "@/app/data/iglesia";
import { getSettings } from "@/src/utils/settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadatos globales dinámicos: se editan desde el panel (SEO → site_settings)
// con respaldo automático a los valores por defecto.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const keywords = s.seo.keywords
    ? s.seo.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;

  return {
    title: {
      default: s.seo.title,
      template: "%s | Centro Cristiano Mieles",
    },
    description: s.seo.description,
    keywords,
    metadataBase: new URL("https://ccmieles.cl"),
    icons: {
      icon: LOGO_URL,
      shortcut: LOGO_URL,
      apple: LOGO_URL,
    },
    openGraph: {
      title: s.seo.title,
      description: s.seo.description,
      url: IGLESIA.url,
      siteName: s.nombre,
      locale: "es_CL",
      type: "website",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: s.nombre,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seo.title,
      description: s.seo.description,
      images: [OG_IMAGE],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
        {/* Vercel Web Analytics + Core Web Vitals (LCP/INP/CLS) para SEO. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
