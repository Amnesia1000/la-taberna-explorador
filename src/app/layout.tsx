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

export const metadata: Metadata = {
  title: "La Taberna del Explorador // Alquiler de Juegos de Mesa",
  description: "Alquiler y catálogo de juegos de mesa en la mítica Taberna del Explorador.",
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
