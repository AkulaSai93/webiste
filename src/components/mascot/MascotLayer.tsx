"use client";

import dynamic from "next/dynamic";

// WebGL mascot is client-only
const Mascot = dynamic(() => import("./Mascot"), { ssr: false });

export default function MascotLayer() {
  return <Mascot />;
}
