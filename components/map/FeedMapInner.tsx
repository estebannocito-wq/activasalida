"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { formatFechaCorta } from "@/lib/format";
import type { FeedMapPoint } from "./FeedMap";

// Pin de marca: gota coral #F4552E con un círculo blanco arriba que aloja el
// emoji de la categoría. Sombra suave vía drop-shadow. Cacheamos por emoji para
// no recrear el divIcon en cada render.
const pinCache = new Map<string, L.DivIcon>();

function makePinIcon(emoji: string): L.DivIcon {
  const cached = pinCache.get(emoji);
  if (cached) return cached;
  const html = `
    <div style="position:relative;width:42px;height:50px;filter:drop-shadow(0 4px 5px rgba(30,42,120,0.35))">
      <svg width="42" height="50" viewBox="0 0 42 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 1.5C10.5 1.5 2 9.6 2 19.6 2 33 21 48.5 21 48.5S40 33 40 19.6C40 9.6 31.5 1.5 21 1.5z" fill="#F4552E" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="21" cy="19" r="13.5" fill="#ffffff"/>
      </svg>
      <span style="position:absolute;top:7px;left:0;width:42px;text-align:center;font-size:19px;line-height:26px">${emoji}</span>
    </div>`;
  const icon = L.divIcon({
    className: "as-feed-pin",
    html,
    iconSize: [42, 50],
    iconAnchor: [21, 48],
    popupAnchor: [0, -44],
  });
  pinCache.set(emoji, icon);
  return icon;
}

// Punto azul tipo "vos estás acá".
const userDotIcon = L.divIcon({
  className: "as-feed-userdot",
  html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#1E2A78;border:3px solid #fff;box-shadow:0 0 0 4px rgba(30,42,120,0.25)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Leaflet a veces calcula tamaño 0 cuando el contenedor recién aparece (carga
// dinámica / dentro de una tab) y no pinta los tiles hasta un resize.
function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 0);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// Recentra el mapa cuando llega la geolocalización del usuario.
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom() < 12 ? 13 : map.getZoom());
  }, [map, lat, lng]);
  return null;
}

export default function FeedMapInner({
  center,
  userPos,
  points,
}: {
  center: { lat: number; lng: number };
  userPos: { lat: number; lng: number } | null;
  points: FeedMapPoint[];
}) {
  return (
    <div className="h-[64vh] min-h-[400px] w-full overflow-hidden rounded-3xl border border-tinta/10 shadow-lg shadow-noche/10">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPos ? (
          <>
            <Marker position={[userPos.lat, userPos.lng]} icon={userDotIcon} />
            <Recenter lat={userPos.lat} lng={userPos.lng} />
          </>
        ) : null}

        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={makePinIcon(p.emoji)}>
            <Popup>
              <div className="min-w-[160px]">
                {p.categoriaLabel ? (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-rio">
                    {p.categoriaLabel}
                  </span>
                ) : null}
                <p className="mt-0.5 text-sm font-bold leading-snug text-noche">
                  {p.titulo}
                </p>
                <p className="mt-0.5 text-xs text-tinta/60">
                  📅 {formatFechaCorta(p.fecha)}
                </p>
                <Link
                  href={`/salida/${p.id}`}
                  className="mt-2 inline-flex h-8 items-center justify-center rounded-lg bg-rio px-3 text-xs font-semibold text-crema"
                >
                  Ver actividad
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        <InvalidateOnMount />
      </MapContainer>
    </div>
  );
}
