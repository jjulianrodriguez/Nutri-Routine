import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import Script from "next/script";

import { Providers } from "./providers";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nutrición Con Enfoque · Mariana y Camila Rodríguez Méndez",
  description:
    "Nutrición funcional e integrativa con la Dra. Mariana Rodríguez Méndez + entrenamiento personalizado con Camila Rodríguez Méndez.",
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
      className={`${display.variable} ${manrope.variable}`}
    >
      <head>
        <Script
          id="nce-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
