// Badge dinámico de rango (dos tracks: host y tripulante).
// Recibe el valor crudo de profiles.rango_host / profiles.rango_tripulante.
type RangoInfo = { emoji: string; label: string; className: string; title: string };

const RANGOS: Record<string, RangoInfo> = {
  // ── Organizador ─────────────────────────────────────────────────────────
  anfitrion_junior: {
    emoji: "🌱",
    label: "Organizador",
    className: "bg-emerald-100 text-emerald-700",
    title: "Organizo su primera actividad",
  },
  capitan: {
    emoji: "🔥",
    label: "Activo",
    className: "bg-noche text-crema",
    title: "3 o mas actividades finalizadas como organizador y buena reputacion",
  },
  capitan_maestro: {
    emoji: "⭐",
    label: "Estrella",
    className: "bg-amber-600 text-white",
    title: "10 o mas actividades finalizadas como organizador y muy buena reputacion",
  },
  gran_capitan: {
    emoji: "🏆",
    label: "Estrella",
    className: "bg-yellow-400 text-noche",
    title: "25 o mas actividades finalizadas como organizador y reputacion excelente",
  },
  // ── Participante ──────────────────────────────────────────────────────────
  tripulante: {
    emoji: "👋",
    label: "Sumate",
    className: "bg-rio/15 text-rio",
    title: "Se sumo a su primera actividad",
  },
  tripulante_experto: {
    emoji: "🙌",
    label: "Habitue",
    className: "bg-rio text-crema",
    title: "5 o mas actividades finalizadas como invitado y buena reputacion",
  },
  tripulante_veterano: {
    emoji: "🤙",
    label: "Crack del plan",
    className: "bg-sky-800 text-crema",
    title: "15 o mas actividades finalizadas como invitado y muy buena reputacion",
  },
};

export default function RangoBadge({
  rango,
  className = "",
}: {
  rango: string | null | undefined;
  className?: string;
}) {
  if (!rango) return null;
  const info = RANGOS[rango];
  if (!info) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${info.className} ${className}`}
      title={info.title}
    >
      <span aria-hidden>{info.emoji}</span> {info.label}
    </span>
  );
}
