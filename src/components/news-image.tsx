"use client";

import { useState } from "react";

// Publisher images: lazy, no referrer (avoids hotlink blocks), hidden if they fail to load.
export default function NewsImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={className} />
  );
}
