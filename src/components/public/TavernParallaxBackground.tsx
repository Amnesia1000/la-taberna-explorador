"use client";

import { useEffect, useState } from "react";

export default function TavernParallaxBackground() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Desplazamiento a velocidad reducida (30% de la velocidad de scroll) para un parallax notable y fluido
          setOffsetY(window.scrollY * 0.3);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 -top-12 w-full h-[150vh] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20, 11, 6, 0.45) 0%, rgba(20, 11, 6, 0.15) 30%, rgba(18, 9, 5, 0.65) 100%), url('/tavern-wall.jpg')`,
          transform: `translate3d(0, -${offsetY}px, 0)`,
          willChange: "transform",
        }}
      />
    </div>
  );
}
