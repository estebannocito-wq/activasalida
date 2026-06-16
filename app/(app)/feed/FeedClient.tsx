"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIAS,
  categoriaLabel,
  formatFechaCorta,
  formatPesos,
} from "@/lib/format";
import CapitanBadge from "@/components/CapitanBadge";
import PortadaCover from "@/components/PortadaCover";
import FeedMap, { type FeedMapPoint } from "@/components/map/FeedMap";

type Host = {
  nombre: string | null;
  foto_url: string | null;
  reputacion_promedio: number | null;
  es_capitan: boolean | null;
};

type Costo = { concepto: string; monto: number };

export type SalidaFeed = {
  id: string;
  titulo: string;
  fecha_hora: string;
  cierre_inscripcion: string | null;
  punto_encuentro_texto: string | null;
  punto_encuentro_lat: number | null;
  punto_encuentro_lng: number | null;
  cupos_total: number;
  cupos_ocupados: number;
  participantes_minimos: number | null;
  transporte: string;
  categoria: string | null;
  tipo_otro: string | null;
  edad_min: number | null;
  edad_max: number | null;
  costos: Costo[] | null;
  estado: string;
  host_id: string;
  imagen_portada: string | null;
  host: Host | Host[] | null;
};

type RangoFilter = "7d" | "2sem" | "4sem";
type TransporteFilter = "todas" | "lancha" | "kayak" | "a_pie";
type Vista = "mapa" | "lista";

// Rosario como centro de respaldo si no hay geolocalización.
const ROSARIO = { lat: -32.9468, lng: -60.6393 };

// Emoji por categoría para el pin del mapa (independiente del emoji de portada).
const PIN_EMOJI: Record<string, string> = {
  deporte: "⚽",
  juntada: "🧉",
  cine_teatro: "🎬",
  viaje: "✈️",
  caminata: "🥾",
  juegos: "🎲",
  after: "🎉",
  otro: "📌",
};

const RANGOS: { value: RangoFilter; label: string; dias: number; sufijo: string }[] =
  [
    { value: "7d", label: "7 días", dias: 7, sufijo: "en los próximos 7 días" },
    {
      value: "2sem",
      label: "2 semanas",
      dias: 14,
      sufijo: "en las próximas 2 semanas",
    },
    {
      value: "4sem",
      label: "4 semanas",
      dias: 28,
      sufijo: "en las próximas 4 semanas",
    },
  ];

const TRANSPORTES: { value: TransporteFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "lancha", label: "Auto" },
  { value: "kayak", label: "Transporte público" },
  { value: "a_pie", label: "A pie" },
];

function getHost(s: SalidaFeed): Host | null {
  if (!s.host) return null;
  if (Array.isArray(s.host)) return s.host[0] ?? null;
  return s.host;
}

function withinDays(iso: string, dias: number): boolean {
  const date = new Date(iso).getTime();
  const now = Date.now();
  const limite = now + dias * 24 * 60 * 60 * 1000;
  return date <= limite;
}

function transporteMatch(t: string, filter: TransporteFilter): boolean {
  if (filter === "todas") return true;
  if (filter === "lancha") return t?.startsWith("lancha");
  return t === filter;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtKm(km: number): string {
  if (km < 1) return `a ${Math.round(km * 1000)} m`;
  return `a ${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

function initials(name?: string | null) {
  return (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PAGE_SIZE = 10;

export default function FeedClient({ salidas }: { salidas: SalidaFeed[] }) {
  const [rango, setRango] = useState<RangoFilter>("2sem");
  const [vista, setVista] = useState<Vista>("mapa");
  const [transporte, setTransporte] = useState<TransporteFilter>("todas");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const rangoActual = RANGOS.find((r) => r.value === rango)!;
  const filtrosActivos = (transporte !== "todas" ? 1 : 0) + categorias.length;

  // Geolocalización no bloqueante: pedimos el permiso al montar y, si el
  // usuario la concede, centramos el mapa y ordenamos por cercanía. Si la
  // niega o falla, seguimos con Rosario como centro.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  function toggleCategoria(value: string) {
    setCategorias((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  // Conjunto base: respeta rango de fecha + filtros secundarios. Manda el
  // conteo del banner, los pines del mapa y la lista.
  const filtradas = useMemo(() => {
    return salidas.filter((s) => {
      if (!withinDays(s.fecha_hora, rangoActual.dias)) return false;
      if (!transporteMatch(s.transporte, transporte)) return false;
      if (categorias.length > 0 && !categorias.includes(s.categoria ?? ""))
        return false;
      return true;
    });
  }, [salidas, rangoActual.dias, transporte, categorias]);

  const conDistancia = useMemo(() => {
    const arr = filtradas.map((s) => ({
      salida: s,
      dist:
        pos && s.punto_encuentro_lat != null && s.punto_encuentro_lng != null
          ? haversineKm(
              pos.lat,
              pos.lng,
              s.punto_encuentro_lat,
              s.punto_encuentro_lng,
            )
          : null,
    }));
    if (pos) {
      arr.sort((a, b) => {
        if (a.dist == null && b.dist == null) return 0;
        if (a.dist == null) return 1;
        if (b.dist == null) return -1;
        return a.dist - b.dist;
      });
    }
    return arr;
  }, [filtradas, pos]);

  // Pines del mapa: solo las que tienen coordenadas.
  const puntos = useMemo<FeedMapPoint[]>(() => {
    return filtradas
      .filter(
        (s) => s.punto_encuentro_lat != null && s.punto_encuentro_lng != null,
      )
      .map((s) => ({
        id: s.id,
        lat: s.punto_encuentro_lat as number,
        lng: s.punto_encuentro_lng as number,
        titulo: s.titulo,
        fecha: s.fecha_hora,
        categoriaLabel: categoriaLabel(s.categoria, s.tipo_otro),
        emoji: PIN_EMOJI[s.categoria ?? "otro"] ?? "📌",
      }));
  }, [filtradas]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [rango, transporte, categorias, pos]);

  const visibles = conDistancia.slice(0, visible);
  const hayMas = conDistancia.length > visible;
  const count = filtradas.length;
  const center = pos ?? ROSARIO;

  return (
    <div className="mt-6">
      {/* ── Banner hero del conteo ── */}
      {count > 0 ? (
        <div
          className="flex items-center gap-4 rounded-3xl px-5 py-5 text-crema shadow-lg shadow-noche/20"
          style={{
            background: "linear-gradient(135deg, #F4552E 0%, #1E2A78 100%)",
          }}
        >
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl"
            aria-hidden
          >
            📍
          </span>
          <p className="leading-tight">
            <span className="text-4xl font-extrabold sm:text-5xl">{count}</span>{" "}
            <span className="text-base font-semibold sm:text-lg">
              {count === 1 ? "actividad" : "actividades"} cerca tuyo {rangoActual.sufijo}
            </span>
          </p>
        </div>
      ) : null}

      {/* ── Controles: rango de fecha + toggle Mapa/Lista ── */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {RANGOS.map((opt) => {
            const active = rango === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRango(opt.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-[0.97] ${
                  active
                    ? "border-rio bg-rio text-crema shadow-sm shadow-rio/30"
                    : "border-tinta/15 bg-white text-tinta/70 hover:border-rio/30"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowFiltros((v) => !v)}
            aria-expanded={showFiltros}
            className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-[0.97] ${
              showFiltros || filtrosActivos > 0
                ? "border-rio bg-rio/10 text-rio"
                : "border-tinta/15 bg-white text-tinta/70 hover:border-rio/30"
            }`}
          >
            Filtros{filtrosActivos > 0 ? ` (${filtrosActivos})` : ""}
            <span aria-hidden>{showFiltros ? "▲" : "▼"}</span>
          </button>
        </div>

        {/* Segmented control Mapa | Lista */}
        <div className="inline-flex rounded-full border border-tinta/15 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setVista("mapa")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              vista === "mapa"
                ? "bg-rio text-crema shadow-sm shadow-rio/30"
                : "text-tinta/60 hover:text-tinta"
            }`}
          >
            🗺️ Mapa
          </button>
          <button
            type="button"
            onClick={() => setVista("lista")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              vista === "lista"
                ? "bg-rio text-crema shadow-sm shadow-rio/30"
                : "text-tinta/60 hover:text-tinta"
            }`}
          >
            ☰ Lista
          </button>
        </div>
      </div>

      {showFiltros ? (
        <div className="mt-3 space-y-2 rounded-2xl border border-tinta/10 bg-white/60 p-3">
          <ChipGroup
            label="Cómo"
            value={transporte}
            onChange={(v) => setTransporte(v as TransporteFilter)}
            options={TRANSPORTES}
          />
          <MultiChipGroup
            label="Tipo"
            selected={categorias}
            onToggle={toggleCategoria}
            onClear={() => setCategorias([])}
            options={CATEGORIAS}
          />
        </div>
      ) : null}

      {/* ── Estado vacío atractivo ── */}
      {count === 0 ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-tinta/10 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-rio/10 text-4xl">
            🧭
          </div>
          <h2 className="mt-5 text-balance text-2xl font-extrabold tracking-tight text-noche">
            Todavía no hay planes cerca tuyo.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-pretty text-tinta/65">
            Arrancá vos el primero y que la gente se sume.
          </p>
          <Link
            href="/salida/nueva"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-rio px-7 text-base font-semibold text-crema shadow-lg shadow-rio/25 transition hover:brightness-105 active:scale-[0.98]"
          >
            Crear actividad
          </Link>
          {(rango !== "4sem" || filtrosActivos > 0) && salidas.length > 0 ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setRango("4sem");
                  setTransporte("todas");
                  setCategorias([]);
                }}
                className="mt-5 text-sm font-semibold text-rio"
              >
                Ampliar a 4 semanas y limpiar filtros
              </button>
            </div>
          ) : null}
        </div>
      ) : vista === "mapa" ? (
        /* ── Vista MAPA ── */
        <div className="mt-5">
          <FeedMap center={center} userPos={pos} points={puntos} />
          <p className="mt-2 text-center text-xs text-tinta/50">
            {puntos.length}{" "}
            {puntos.length === 1 ? "actividad ubicada" : "actividades ubicadas"}{" "}
            en el mapa
            {puntos.length < count
              ? ` · ${count - puntos.length} sin ubicación (mirá la lista)`
              : ""}
          </p>
        </div>
      ) : (
        /* ── Vista LISTA ── */
        <div className="mt-5">
          <p className="text-sm font-medium text-tinta/60">
            {count} {count === 1 ? "actividad" : "actividades"}
            {pos ? " · más cercanas primero" : ""}
          </p>
          <ul className="mt-3 space-y-2.5">
            {visibles.map(({ salida, dist }) => (
              <li key={salida.id}>
                <SalidaCard salida={salida} distanciaKm={dist} />
              </li>
            ))}
          </ul>
          {hayMas ? (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-tinta/15 bg-white text-sm font-semibold text-tinta/70 active:scale-[0.98]"
            >
              Ver más ({count - visible} más)
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ChipGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[11px] uppercase tracking-wide text-tinta/40">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-[0.97] ${
                active
                  ? "border-rio bg-rio text-crema"
                  : "border-tinta/15 bg-white text-tinta/70 hover:border-rio/30"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiChipGroup({
  label,
  selected,
  onToggle,
  onClear,
  options,
}: {
  label: string;
  selected: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1.5 w-14 shrink-0 text-[11px] uppercase tracking-wide text-tinta/40">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-2">
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-tinta/15 bg-white px-3 py-1.5 text-xs font-medium text-tinta/50"
          >
            Todas
          </button>
        ) : (
          <span className="rounded-full border border-rio bg-rio px-3 py-1.5 text-xs font-medium text-crema">
            Todas
          </span>
        )}
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-[0.97] ${
                active
                  ? "border-rio bg-rio text-crema"
                  : "border-tinta/15 bg-white text-tinta/70 hover:border-rio/30"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SalidaCard({
  salida,
  distanciaKm,
}: {
  salida: SalidaFeed;
  distanciaKm: number | null;
}) {
  const host = getHost(salida);
  const cuposLibres = Math.max(
    0,
    salida.cupos_total - (salida.cupos_ocupados ?? 0),
  );
  const ratio = salida.cupos_total > 0 ? cuposLibres / salida.cupos_total : 0;
  const ocupadoPct = Math.min(
    100,
    Math.round(
      ((salida.cupos_total - cuposLibres) / Math.max(1, salida.cupos_total)) *
        100,
    ),
  );

  const total = (salida.costos ?? []).reduce(
    (s, c) => s + (Number(c?.monto) || 0),
    0,
  );
  const porPersona =
    salida.cupos_total > 0 ? Math.ceil(total / salida.cupos_total) : 0;

  let badgeLabel = "Abierta";
  let badgeClass = "bg-rio/15 text-rio";
  if (cuposLibres === 0 || salida.estado === "completa") {
    badgeLabel = "Completa";
    badgeClass = "bg-tinta/10 text-tinta/60";
  } else if (ratio <= 0.3) {
    badgeLabel = "Últimos cupos";
    badgeClass = "bg-arena/15 text-arena";
  }

  const reputacion = Number(host?.reputacion_promedio ?? 0);
  const tipoLabel = categoriaLabel(salida.categoria, salida.tipo_otro);

  let edadBadge: string | null = null;
  if (salida.edad_min != null && salida.edad_max != null) {
    edadBadge = `Edad ${salida.edad_min}-${salida.edad_max}`;
  } else if (salida.edad_min != null) {
    edadBadge = `Edad ${salida.edad_min}+`;
  } else if (salida.edad_max != null) {
    edadBadge = `Edad hasta ${salida.edad_max}`;
  }

  return (
    <Link
      href={`/salida/${salida.id}`}
      className="flex gap-3 overflow-hidden rounded-2xl bg-white p-2.5 shadow-sm transition active:scale-[0.99]"
    >
      <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl">
        <PortadaCover
          imagenPortada={salida.imagen_portada}
          categoria={salida.categoria}
          tipoOtro={salida.tipo_otro}
          titulo={salida.titulo}
          iconClassName="text-2xl"
          showLabel={false}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-1.5">
          {tipoLabel ? (
            <span className="inline-flex max-w-[55%] items-center truncate rounded-full bg-rio/10 px-2 py-0.5 text-[11px] font-semibold text-rio">
              {tipoLabel}
            </span>
          ) : null}
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}
          >
            {badgeLabel}
          </span>
          {edadBadge ? (
            <span className="ml-auto shrink-0 rounded-full bg-noche/5 px-2 py-0.5 text-[11px] font-semibold text-tinta/60">
              {edadBadge}
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded-full bg-rio text-[9px] font-bold text-crema">
            {host?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={host.foto_url}
                alt={host?.nombre ?? "Organizador"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials(host?.nombre)}</span>
            )}
          </span>
          <span className="truncate text-xs font-medium text-tinta/70">
            {host?.nombre ?? "Anónimo"}
          </span>
          {host?.es_capitan ? <CapitanBadge /> : null}
          <span className="ml-auto flex shrink-0 items-center gap-0.5 text-[11px] text-tinta/50">
            <span aria-hidden className="text-arena">
              ★
            </span>
            {reputacion.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-1 truncate text-sm font-semibold leading-tight text-noche">
          {salida.titulo}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-[11px] text-tinta/60">
          <span aria-hidden>📅</span>
          <span className="shrink-0">{formatFechaCorta(salida.fecha_hora)}</span>
          {salida.punto_encuentro_texto ? (
            <>
              <span aria-hidden className="text-tinta/30">
                ·
              </span>
              <span aria-hidden>📍</span>
              <span className="truncate">{salida.punto_encuentro_texto}</span>
            </>
          ) : null}
          {distanciaKm != null ? (
            <span className="shrink-0 font-medium text-noche/70">
              · {fmtKm(distanciaKm)}
            </span>
          ) : null}
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tinta/10">
            <div
              className="h-full rounded-full bg-rio transition-all"
              style={{ width: `${ocupadoPct}%` }}
              aria-hidden
            />
          </div>
          <span className="shrink-0 text-[11px] text-tinta/60">
            {cuposLibres}/{salida.cupos_total}
          </span>
          {total > 0 ? (
            <span className="shrink-0 text-[11px] font-semibold text-rio">
              {formatPesos(porPersona)}
            </span>
          ) : (
            <span className="shrink-0 text-[11px] text-tinta/50">Gratis</span>
          )}
        </div>
      </div>
    </Link>
  );
}
