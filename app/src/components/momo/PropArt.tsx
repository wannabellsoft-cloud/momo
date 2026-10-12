"use client";

import { useId, useMemo } from "react";
import { propSvg } from "./props-art";

/** Vector 2.5D prop (gold bell or alarm clock), sharp at any size. */
export function PropArt({ name, size, className }: { name: "bell" | "alarm"; size: number; className?: string }) {
  const id = "pa" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const html = useMemo(() => propSvg(name, id, `width="${size}" height="${size}" style="display:block;overflow:visible"`), [name, id, size]);
  return <span aria-hidden="true" className={`inline-block flex-none ${className ?? ""}`} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: html }} />;
}
