import type { Metadata } from "next";
import { Instrument_Sans, Manrope } from "next/font/google";
import Script from "next/script";

import { Providers } from "./providers";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const display = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const geist = Manrope({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Nutrición Con Enfoque",
  title: {
    default: "Nutrición Con Enfoque · Nutrición y entrenamiento personalizado",
    template: "%s · Nutrición Con Enfoque",
  },
  description:
    "Acompañamiento privado de nutrición funcional, entrenamiento personalizado y seguimiento profesional con Mariana y Camila Rodríguez Méndez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${display.variable} ${geist.variable}`}
    >
      <head>
        <Script
          id="nce-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
