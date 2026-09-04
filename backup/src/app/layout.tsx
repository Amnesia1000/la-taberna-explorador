import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catálogo y Gestión de Juegos de Mesa // Taberna",
  description: "Sistema minimalista de alquiler y catálogo de juegos de mesa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full bg-white antialiased">
      <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
