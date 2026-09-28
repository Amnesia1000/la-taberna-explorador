import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function findGame(id: string) {
  try {
    return await prisma.game.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const game = await findGame(id);
  if (!game) return { title: "Juego no encontrado" };
  const title = `${game.name} — Alquiler`;
  const description =
    game.description.length > 160
      ? `${game.description.slice(0, 157)}…`
      : game.description;
  const images = game.image ? [{ url: game.image }] : undefined;
  return {
    title,
    description,
    openGraph: { title, description, images, type: "website" },
    twitter: { card: "summary_large_image", title, description, images: game.image ? [game.image] : undefined },
  };
}

export default async function GameSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await findGame(id);
  if (!game) notFound();
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="parchment-folio border-4 border-[#733d18] rounded-sm p-8 max-w-lg w-full text-center shadow-2xl">
        <p className="font-tavern text-xs uppercase tracking-widest text-[#b45309] font-bold">
          Crónica del Grimorio
        </p>
        <h1 className="font-tavern text-2xl font-bold uppercase text-[#2c1409] mt-1">
          {game.name}
        </h1>
        <p className="text-sm font-serif text-[#4a2e19] mt-3 line-clamp-4">
          {game.description}
        </p>
        <p className="font-tavern text-3xl font-bold text-[#2b170c] mt-4">
          ${game.price.toLocaleString("es-AR")}
        </p>
        <Link
          href={`/?juego=${game.id}`}
          className="tavern-btn-gold inline-flex items-center gap-2 rounded-sm mt-6 px-6 py-3"
        >
          Ver ficha en el catálogo
        </Link>
      </div>
    </main>
  );
}
