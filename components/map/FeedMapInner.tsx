"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { formatFechaCorta } from "@/lib/format";
import type { FeedMapPoint } from "./FeedMap";

// Pin coral de marca (rio #F4552E) como divIcon — evita los assets rotos del
// marcador por defecto de Leaflet con bundlers.
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 30 38"><path d="M15 1C7.8 1 2 6.6 2 13.6 2 22 15 37 15 37s13-15 13-23.4C28 6.6 22.2 1 15 1z" fill="#F4552E" stroke="#ffffff" stroke-width="2"/><circle cx="15" cy="13.5" r="4.5" fill="#ffffff"/></svg>`;

const coralPinIcon = L.divIcon({
  className: "as-feed-pin",
  html: PIN_SVG,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
});

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
    <div className="h-[60vh] min-h-[360px] w-full overflow-hidden rounded-2xl border border-tinta/10 shadow-sm">
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
            <Marker
              position={[userPos.lat, userPos.lng]}
              icon={userDotIcon}
            />
            <Recenter lat={userPos.lat} lng={userPos.lng} />
          </>
        ) : null}

        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={coralPinIcon}>
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
