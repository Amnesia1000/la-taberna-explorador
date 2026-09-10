"use client";

import { useEffect, useState } from "react";

export default function TavernParallaxBackground() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setOffsetY(window.scrollY * 0.2);
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
      className="absolute inset-0 pointer-events-none -z-10 overflow-hidden w-full min-h-full"
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 top-0 w-full"
        style={{
          transform: `translate3d(0, -${offsetY}px, 0)`,
          willChange: "transform",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tavern-wall.jpg"
          alt=""
          className="w-full h-auto block object-cover"
        />
        {/* Capa de degradado oscuro sobre la imagen para mantener la lectura del pergamino */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#140b06]/45 via-[#140b06]/15 to-[#120905]/65 w-full h-full" />
      </div>
    </div>
  );
}