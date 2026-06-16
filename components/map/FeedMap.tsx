"use client";

import dynamic from "next/dynamic";

export type FeedMapPoint = {
  id: string;
  lat: number;
  lng: number;
  titulo: string;
  fecha: string;
  categoriaLabel: string | null;
};

const Inner = dynamic(() => import("./FeedMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[60vh] min-h-[360px] w-full animate-pulse rounded-2xl bg-tinta/5" />
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
