"use client";

import { BASE } from "@/lib/base";
import { isNight } from "@/lib/date";
import { startMusic, stopMusic } from "@/lib/music";
import { useMomo } from "@/lib/store";
import { cx } from "./ui";

/** Momo's first-use tutorial video (public/tutorial, from `npm run tutorial:video`).
    It has Momo's narration, so the background music pauses while it plays. */
export function GuideVideo({ className }: { className?: string }) {
  const { music, musicTrack } = useMomo((s) => s.settings);
  const resumeMusic = () => {
    if (music) startMusic(musicTrack === "time" ? (isNight(new Date()) ? "lullaby" : "box") : musicTrack);
  };
  return (
    <video
      className={cx("block aspect-[9/16] w-full bg-(--surface-soft) object-contain", className)}
      src={`${BASE}/tutorial/momo-first-use.mp4`}
      poster={`${BASE}/tutorial/poster.jpg`}
      controls
      playsInline
      preload="metadata"
      aria-label="วิดีโอสอนเริ่มใช้งานโมโม่ ครั้งแรก"
      onPlay={stopMusic}
      onPause={resumeMusic}
      onEnded={resumeMusic}
    />
  );
}
