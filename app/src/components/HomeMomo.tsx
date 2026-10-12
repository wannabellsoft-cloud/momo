"use client";

import type { MomoState } from "./momo/MomoBunny";
import { ReactiveMomo } from "./ReactiveMomo";

/** Animated Momo for the Home hero: pop-in, idle hop, floating hearts, tap-to-play, launch greeting. */
export function HomeMomo({ state, bubble }: { state: MomoState; bubble: string }) {
  return <ReactiveMomo state={state} bubble={bubble} size={170} greet talks priority className="mt-[6px] [&>button]:-ml-[10px]" bubbleClassName="mt-3" />;
}
