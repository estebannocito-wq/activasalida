import Link from "next/link";
import LandingHeader from "@/components/LandingHeader";

/* ── Datos ──────────────────────────────────────────────────────────────── */

const PASOS = [
  {
    n: "1",
    titulo: "Crea o sumate a una actividad",
    texto:
      "Arma la tuya en un minuto (fecha, lugar, que llevar) o pedi sumarte a la de otro con una presentacion.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    n: "2",
    titulo: "El organizador confirma el grupo",
    texto:
      "El organizador ve quien quiere ir, lee su presentacion y elige con quien sale. Nadie se suma sin su OK.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M15 11l2 2 4-4" />
        <circle cx="9" cy="8" r="4" />
        <path d="M3 20c0-3.3 2.7-6 6-6 1.6 0 3 .6 4.1 1.6" />
      </svg>
    ),
  },
  {
    n: "3",
    titulo: "Al plan, y despues se califican",
    texto:
      "Lugar, horario y costos compartidos, todo en un lugar. Al volver, organizador e invitados se califican.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

const TIPOS = [
  { emoji: "⚽", label: "Deporte" },
  { emoji: "🧉", label: "Juntada" },
  { emoji: "🎬", label: "Cine/Teatro" },
  { emoji: "✈️", label: "Viaje/Escapada" },
  { emoji: "🥾", label: "Caminata/Trekking" },
  { emoji: "🎲", label: "Juegos" },
];

/* Chips flotantes del hero (disposicion organica). */
const HERO_CHIPS = [
  { emoji: "⚽", label: "Deporte", className: "left-[6%] top-[6%] rotate-[-5deg]" },
  { emoji: "🧉", label: "Juntada", className: "right-[4%] top-[2%] rotate-[4deg]" },
  { emoji: "🎬", label: "Cine", className: "left-[18%] top-[40%] rotate-[3deg]" },
  { emoji: "✈️", label: "Viaje", className: "right-[10%] top-[36%] rotate-[-6deg]" },
  { emoji: "🥾", label: "Caminata", className: "left-[2%] bottom-[8%] rotate-[5deg]" },
  { emoji: "🎉", label: "After", className: "right-[16%] bottom-[4%] rotate-[-3deg]" },
];

const CONFIANZA = [
  {
    titulo: "Perfiles reales",
    texto:
      "Foto, presentacion e Instagram. Miras quien es cada uno antes de sumarte.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
  {
    titulo: "El organizador elige su grupo",
    texto:
      "Cada actividad la arma alguien que decide a quien suma. No es un grupo abierto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Calificaciones bidireccionales",
    texto:
      "Despues de cada actividad, organizador e invitados se puntuan. La buena onda construye reputacion.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9L12 3z" />
      </svg>
    ),
  },
  {
    titulo: "Rango Estrella",
    texto:
      "Quienes organizan seguido y mantienen buena reputacion se ganan el rango Estrella.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2 4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5l-8-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

/* Tarjetas de ejemplo del telefono dibujado en CSS. */
const FEED_DEMO = [
  {
    titulo: "Futbol 5 en el club",
    emoji: "⚽",
    cuando: "Sab 20:00",
    lugares: "2 lugares",
    estrella: true,
  },
  {
    titulo: "Mate en el Parque España",
    emoji: "🧉",
    cuando: "Dom 17:00",
    lugares: "4 lugares",
    estrella: false,
  },
  {
    titulo: "Salida al cine",
    emoji: "🎬",
    cuando: "Vie 22:00",
    lugares: "3 lugares",
    estrella: false,
  },
];

/* ── Página ─────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main className="bg-crema text-tinta">
      <LandingHeader />

      {/* ═══ 1. HERO (fondo claro) ═════════════════════════════════════════ */}
      <section
        className="relative isolate overflow-hidden"
        style={{ backgroundColor: "#FFF9F8" }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-14 sm:pb-28 sm:pt-20 lg:grid-cols-2">
          {/* Columna texto */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-rio/10 px-3 py-1 text-xs font-semibold text-rio ring-1 ring-inset ring-rio/20">
              <span className="h-1.5 w-1.5 rounded-full bg-rio" />
              Planes presenciales todo el año
            </span>

            <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.02] tracking-tight text-noche sm:text-6xl">
              Tu proximo <span style={{ color: "#F4552E" }}>plan</span> empieza
              aca.
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-tinta/75 sm:text-xl">
              Un partido, una juntada, una escapada o una caminata. Planes
              presenciales con gente que ya sabes quien es. Armas el tuyo o te
              sumas al de otro, ves quien va antes de salir, y se califican
              despues.{" "}
              <span className="font-semibold text-noche">
                Sin grupo de WhatsApp.
              </span>
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="inline-flex h-13 items-center justify-center rounded-2xl bg-rio px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-rio/25 transition hover:brightness-105 active:scale-[0.98]"
              >
                Crear cuenta
              </Link>
              <Link
                href="/feed"
                className="inline-flex h-13 items-center justify-center rounded-2xl border border-noche/25 bg-white px-7 py-3.5 text-base font-semibold text-noche transition hover:bg-noche/5 active:scale-[0.98]"
              >
                Explorar actividades
              </Link>
            </div>
          </div>

          {/* Columna cluster de chips flotantes */}
          <div
            aria-hidden
            className="relative mx-auto hidden h-80 w-full max-w-md lg:block"
          >
            {HERO_CHIPS.map((c) => (
              <span
                key={c.label}
                className={`absolute inline-flex items-center gap-2 rounded-2xl border border-noche/10 bg-white px-4 py-3 text-sm font-semibold text-noche shadow-lg shadow-noche/5 ${c.className}`}
              >
                <span className="text-xl">{c.emoji}</span>
                {c.label}
              </span>
            ))}
            {/* halo suave de fondo, en coral muy tenue (no es el sol de vamosalrio) */}
            <div
              className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(244,85,46,0.10) 0%, rgba(244,85,46,0) 70%)",
              }}
            />
          </div>
        </div>

        {/* Corte diagonal sutil hacia la seccion siguiente (reemplaza la onda) */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-10 sm:h-16"
          style={{
            backgroundColor: "#FFF7F4",
            clipPath: "polygon(0 100%, 100% 100%, 100% 0)",
          }}
        />
      </section>

      {/* ═══ 2. EL PROBLEMA ════════════════════════════════════════════════ */}
      <section className="bg-crema">
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-arena">
            El problema de siempre
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-noche sm:text-5xl">
            Se viene el finde y queres hacer algo.
          </h2>
          <div className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-tinta/70">
            <p>
              Coordinar es un quilombo: los grupos de WhatsApp se pierden, los
              planes se caen, y nunca sabes bien con quien vas a terminar.{" "}
              <span className="font-semibold text-tinta">
                Te conectamos con la gente antes de salir
              </span>{" "}
              para cualquier plan presencial: deporte, juntada, viaje o lo que se
              te ocurra.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 3. CÓMO FUNCIONA ══════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rio">
              Como funciona
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-noche sm:text-4xl">
              De la idea al plan, en tres pasos.
            </h2>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-3">
            {PASOS.map((paso) => (
              <li
                key={paso.n}
                className="relative rounded-3xl border border-tinta/10 bg-crema p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rio/10 text-rio">
                    {paso.icon}
                  </span>
                  <span className="text-5xl font-bold text-tinta/10">
                    {paso.n}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-snug text-noche">
                  {paso.titulo}
                </h3>
                <p className="mt-2 text-pretty leading-relaxed text-tinta/65">
                  {paso.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ 4. PARA QUÉ SALÍS ═════════════════════════════════════════════ */}
      <section className="bg-crema">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-arena">
              Para que salis
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-noche sm:text-4xl">
              Cada actividad tiene su onda.
            </h2>
            <p className="mt-3 text-pretty text-lg text-tinta/65">
              Elegis el tipo cuando armas la tuya, y filtras por el que te copa
              en el feed.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {TIPOS.map((t, i) => (
              <li
                key={t.label}
                className="group relative overflow-hidden rounded-3xl border border-tinta/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  aria-hidden
                  className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-70 transition group-hover:scale-110"
                  style={{
                    background:
                      i % 2 === 0
                        ? "radial-gradient(circle, rgba(244,85,46,0.16) 0%, rgba(244,85,46,0) 70%)"
                        : "radial-gradient(circle, rgba(30,42,120,0.16) 0%, rgba(30,42,120,0) 70%)",
                  }}
                />
                <span className="text-4xl">{t.emoji}</span>
                <h3 className="mt-4 font-semibold text-noche">{t.label}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ 5. CONFIANZA (el corazón) ═════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden text-crema">
        <div
          aria-hidden
          className="absolute inset-0 -z-20"
          style={{ background: "#1E2A78" }}
        />
        <div
          aria-hidden
          className="absolute -left-20 top-1/3 -z-10 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(244,85,46,0.35) 0%, rgba(244,85,46,0) 70%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-arena">
              Confianza
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Salir con desconocidos da cosa. Por eso lo armamos al reves.
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-crema/80">
              Aca no te sumas a un plan con cualquiera. Sabes quien es cada uno,
              quien organiza, y como le fue a la gente en sus actividades
              anteriores.
            </p>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {CONFIANZA.map((c) => (
              <li
                key={c.titulo}
                className="flex items-start gap-4 rounded-3xl bg-crema/5 p-6 ring-1 ring-inset ring-crema/10"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rio/20 text-crema">
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-crema">
                    {c.titulo}
                  </h3>
                  <p className="mt-1 text-pretty leading-relaxed text-crema/70">
                    {c.texto}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ 6. ASÍ SE VE POR DENTRO (telefono CSS) ════════════════════════ */}
      <section className="bg-crema">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rio">
              Asi se ve por dentro
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-noche sm:text-4xl">
              Simple, en el telefono, mientras tomas unos mates.
            </h2>
          </div>

          {/* Device frame dibujado en HTML/CSS */}
          <div className="mt-14 flex justify-center">
            <div className="w-[300px] rounded-[2.6rem] border-[10px] border-noche bg-noche p-0 shadow-2xl shadow-noche/30">
              <div className="overflow-hidden rounded-[2rem] bg-crema">
                {/* Barra superior del telefono */}
                <div className="flex items-center justify-between bg-white px-5 py-3.5">
                  <span className="text-base font-bold tracking-tight">
                    <span style={{ color: "#F4552E" }}>activa</span>
                    <span style={{ color: "#1E2A78" }}>salida</span>
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-rio/10 text-sm">
                    🔔
                  </span>
                </div>

                {/* Feed de tarjetas */}
                <div className="space-y-3 px-4 py-4">
                  {FEED_DEMO.map((card) => (
                    <div
                      key={card.titulo}
                      className="rounded-2xl border border-tinta/10 bg-white p-3.5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rio/10 text-2xl">
                          {card.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="truncate text-sm font-semibold text-noche">
                              {card.titulo}
                            </h3>
                            {card.estrella && (
                              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-arena/15 px-1.5 py-0.5 text-[10px] font-bold text-arena">
                                ⭐ Estrella
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-tinta/55">
                            {card.cuando}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="rounded-full bg-noche/5 px-2.5 py-1 text-[11px] font-semibold text-noche">
                          {card.lugares}
                        </span>
                        <span className="rounded-full bg-rio px-3 py-1 text-[11px] font-semibold text-white">
                          Sumarme
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-pretty text-lg text-tinta/65">
            Asi se ve por dentro. Simple, en el telefono.
          </p>
        </div>
      </section>

      {/* ═══ 7. CTA FINAL ══════════════════════════════════════════════════ */}
      <section className="bg-crema px-6 pb-20 sm:pb-28">
        <div
          className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] px-6 py-16 text-center text-crema sm:py-20"
          style={{
            background:
              "linear-gradient(135deg, #1E2A78 0%, #F4552E 70%, #ff7a57 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -right-10 -top-10 -z-10 h-44 w-44 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(244,85,46,0.6) 0%, rgba(244,85,46,0) 70%)",
            }}
          />
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            ¿Listo para tu proximo plan?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-lg leading-relaxed text-crema/85">
            Crea tu cuenta y arma tu primera actividad hoy. Sumas tu grupo en
            minutos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="inline-flex h-13 w-full items-center justify-center rounded-2xl bg-arena px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-arena/25 transition hover:brightness-105 active:scale-[0.98] sm:w-auto"
            >
              Crear cuenta
            </Link>
            <span className="text-sm font-medium text-crema/75">
              Gratis · sin tarjeta
            </span>
          </div>
        </div>
      </section>

      {/* ═══ 8. FOOTER (fondo navy) ════════════════════════════════════════ */}
      <footer style={{ backgroundColor: "#1E2A78" }}>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-full-dark.png"
              alt="activasalida"
              className="h-7 w-auto"
              height={28}
            />
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-crema/70">
              <Link href="/terminos" className="hover:text-crema">
                Terminos
              </Link>
              <Link href="/privacidad" className="hover:text-crema">
                Privacidad
              </Link>
              <Link href="/contacto" className="hover:text-crema">
                Contacto
              </Link>
              <Link href="/ayuda" className="hover:text-crema">
                Ayuda
              </Link>
            </nav>
          </div>
          <p className="mt-6 text-xs text-crema/45">
            Hecho en Rosario, Argentina. · © 2026 activasalida · Kappla SRL
          </p>
        </div>
      </footer>
    </main>
  );
}
