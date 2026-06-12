import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LOGO_URL, OG_IMAGE, IGLESIA } from "@/app/data/iglesia";
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
  title: {
    default: "CCMieles — Centro Cristiano Mieles",
    template: "%s | CCMieles",
  },
  description:
    "Centro Cristiano Mieles — una iglesia para toda la familia. Fundada el 30 de agosto de 2007. Conoce nuestros ministerios, eventos, diario mural y envía tu petición de oración.",
  metadataBase: new URL("https://ccmieles.cl"),
  icons: {
    icon: LOGO_URL,
    shortcut: LOGO_URL,
    apple: LOGO_URL,
  },
  openGraph: {
    title: "CCMieles — Centro Cristiano Mieles",
    description:
      "Una iglesia para toda la familia. Conoce nuestra fe, ministerios y actividades.",
    url: IGLESIA.url,
    siteName: IGLESIA.nombre,
    locale: "es_CL",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Centro Cristiano Mieles",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CCMieles — Centro Cristiano Mieles",
    description:
      "Una iglesia para toda la familia. Conoce nuestra fe, ministerios y actividades.",
    images: [OG_IMAGE],
  },
};

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
      </body>
    </html>
  );
}
