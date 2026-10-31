"use client";

import { useEffect, useRef } from "react";

/**
 * A dot that follows the pointer and a ring that trails it; over anything
 * pressable the ring opens. The ring grows by its size, not by scaling, so its
 * edge stays a crisp hairline. Fine pointers only.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const d = dot.current!;
    const r = ring.current!;
    document.documentElement.dataset.cursor = "";

    let x = -100, y = -100, rx = -100, ry = -100;
    let size = 30, goal = 30;
    let frame = 0;
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const over = (event.target as Element | null)?.closest("a, button, [role=button]");
      goal = over ? 52 : 30;
      if (over) r.dataset.over = "";
      else delete r.dataset.over;
    };
    const loop = () => {
      frame = requestAnimationFrame(loop);
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      size += (goal - size) * 0.18;
      d.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
      r.style.transform = `translate3d(${rx - size / 2}px, ${ry - size / 2}px, 0)`;
      r.style.width = r.style.height = `${size}px`;
    };
    frame = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      delete document.documentElement.dataset.cursor;
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] hidden mix-blend-difference [html[data-cursor]_&]:block">
      <div ref={dot} className="absolute left-0 top-0 size-[6px] rounded-full bg-white" />
      <div
        ref={ring}
        className="absolute left-0 top-0 rounded-full border border-white/50 transition-[background-color,border-color] duration-300 data-[over]:border-white/0 data-[over]:bg-white/15"
      />
    </div>
  );
}
