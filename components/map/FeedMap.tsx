"use client";

import dynamic from "next/dynamic";

export type FeedMapPoint = {
  id: string;
  lat: number;
  lng: number;
  titulo: string;
  fecha: string;
  categoriaLabel: string | null;
  emoji: string;
};

const Inner = dynamic(() => import("./FeedMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[64vh] min-h-[400px] w-full animate-pulse rounded-3xl bg-tinta/5" />
  ),
});

export default function FeedMap({
  center,
  userPos,
  points,
}: {
  center: { lat: number; lng: number };
  userPos: { lat: number; lng: number } | null;
  points: FeedMapPoint[];
}) {
  return <Inner center={center} userPos={userPos} points={points} />;
}
