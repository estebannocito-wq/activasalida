"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

// Mismo pin de marca que el explorador: gota coral #F4552E con un círculo
// blanco que aloja el emoji de la categoría. Sombra suave vía drop-shadow.
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
    className: "as-landing-pin",
    html,
    iconSize: [42, 50],
    iconAnchor: [21, 48],
    popupAnchor: [0, -44],
  });
  pinCache.set(emoji, icon);
  return icon;
}

const ROSARIO = { lat: -32.9468, lng: -60.6393 };

// Planes de ejemplo, repartidos en distintos puntos de Rosario. Solo ilustrativo.
const DEMO_PINES = [
  { emoji: "⚽", titulo: "Fútbol 5", lat: -32.9587, lng: -60.6936 },
  { emoji: "🧉", titulo: "Mate en el parque", lat: -32.9275, lng: -60.6125 },
  { emoji: "🎬", titulo: "Salida al cine", lat: -32.9442, lng: -60.6505 },
  { emoji: "🥾", titulo: "Caminata", lat: -32.9695, lng: -60.6298 },
  { emoji: "🎉", titulo: "After", lat: -32.9361, lng: -60.6612 },
];

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 0);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function LandingMapTeaserInner() {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-3xl border border-noche/10 shadow-lg shadow-noche/15 sm:h-[460px]">
      <MapContainer
        center={[ROSARIO.lat, ROSARIO.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {DEMO_PINES.map((p) => (
          <Marker
            key={p.titulo}
            position={[p.lat, p.lng]}
            icon={makePinIcon(p.emoji)}
          >
            <Popup>
              <span className="text-sm font-bold text-noche">{p.titulo}</span>
            </Popup>
          </Marker>
        ))}
        <InvalidateOnMount />
      </MapContainer>
    </div>
  );
}
