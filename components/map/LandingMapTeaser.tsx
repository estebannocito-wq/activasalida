"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./LandingMapTeaserInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] w-full animate-pulse rounded-3xl bg-noche/5 sm:h-[460px]" />
  ),
});

export default function LandingMapTeaser() {
  return <Inner />;
}
