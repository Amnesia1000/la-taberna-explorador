import type { Metadata } from "next";
import { Cinzel, Crimson_Pro } from "next/font/google";
import TavernParallaxBackground from "@/components/public/TavernParallaxBackground";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  title: {
    default: "La Taberna del Explorador // Alquiler de Juegos de Mesa",
    template: "%s // La Taberna del Explorador",
  },
  description:
    "Alquiler y catálogo de juegos de mesa en la mítica Taberna del Explorador.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "La Taberna del Explorador",
    title: "La Taberna del Explorador // Alquiler de Juegos de Mesa",
    description:
      "Alquiler y catálogo de juegos de mesa en la mítica Taberna del Explorador.",
    images: [{ url: "/Logo.png", width: 478, height: 496 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Taberna del Explorador // Alquiler de Juegos de Mesa",
    description:
      "Alquiler y catálogo de juegos de mesa en la mítica Taberna del Explorador.",
    images: ["/Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a0f08",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cinzel.variable} ${crimson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-serif text-[#2c1d11] selection:bg-[#78350f] selection:text-[#fef3c7] relative">
        <TavernParallaxBackground />
        {children}
      </body>
    </html>
  );
}
