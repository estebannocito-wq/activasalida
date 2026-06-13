"use client";

import { useState } from "react";

/**
 * Wordmark de marca con fallback.
 * Intenta cargar el logo de /brand/. Si el archivo no existe todavia,
 * muestra el wordmark en texto: "activa" coral + "salida" navy.
 * variant "light" = sobre fondo oscuro (usa logo-full-dark.png).
 * variant "dark"  = sobre fondo claro (usa logo-full.png).
 */
export default function BrandWordmark({
  variant = "dark",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src =
    variant === "light" ? "/brand/logo-full-dark.png" : "/brand/logo-full.png";

  if (failed) {
    const salidaColor = variant === "light" ? "#FFFFFF" : "#1E2A78";
    return (
      <span
        className={`font-bold tracking-tight ${className}`}
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <span style={{ color: "#F4552E" }}>activa</span>
        <span style={{ color: salidaColor }}>salida</span>
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt="activasalida"
      className={`h-auto w-auto ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
