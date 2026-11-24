import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Mi Hogar en Línea — Arriendos en Quibdó",
    template: "%s · Mi Hogar en Línea",
  },
  description:
    "Marketplace inmobiliario para arrendar casa, apartamento o habitación en Quibdó y el Chocó. Publica, explora y contacta de forma segura.",
  applicationName: "Mi Hogar en Línea",
  keywords: [
    "arriendo",
    "arrendamiento",
    "Quibdó",
    "Chocó",
    "apartamentos",
    "casas",
    "habitaciones",
    "inmobiliaria",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Mi Hogar en Línea",
    title: "Mi Hogar en Línea — Arriendos en Quibdó",
    description:
      "Encuentra y publica inmuebles en arriendo en Quibdó y el Chocó con anunciantes verificados.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CO"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
