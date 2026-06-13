"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Header de la landing: fondo blanco solido, sticky, con sombra sutil
 * que aparece al scrollear. Logo = isotipo + wordmark en texto.
 */
export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_16px_rgba(30,42,120,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/isotipo.png"
            alt=""
            className="h-8 w-auto"
            height={32}
          />
          <span className="text-xl font-bold tracking-tight">
            <span style={{ color: "#F4552E" }}>activa</span>
            <span style={{ color: "#1E2A78" }}>salida</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-noche/80 transition hover:text-noche"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/registro"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-rio px-4 text-sm font-semibold text-white shadow-sm shadow-rio/25 transition hover:brightness-105 active:scale-[0.98]"
          >
            Crear cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}
