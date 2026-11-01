"use client";

import { useEffect, useRef, useState } from "react";

// Card thumbnail: soft placeholder behind the image, and the whole block removes itself if the
// publisher image fails (no empty dark boxes). The image is never hidden by state, so a load that
// finishes before hydration (and so never fires onLoad) can't leave it invisible.
export default function NewsThumb({ src, className = "h-36" }: { src: string; className?: string }) {
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");
  const ref = useRef<HTMLImageElement>(null);

  // the image may already be finished by the time React hydrates
  useEffect(() => {
    const img = ref.current;
    if (img?.complete) setState(img.naturalWidth > 0 ? "ok" : "failed");
  }, [src]);

  if (state === "failed") return null;
  return (
    <div className={`${className} overflow-hidden bg-kerala-surface ${state === "loading" ? "animate-pulse" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setState("ok")}
        onError={() => setState("failed")}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}
