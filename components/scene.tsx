"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "./motion";

type Props = {
  id?: string;
  /** How long the scene holds, in screen heights (at least 100). */
  length: number;
  /** Where the field changes while the scene holds: [progress 0..1, "<shape> <opacity>"]. */
  marks?: [number, string][];
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

/**
 * A pinned frame. Nothing in it scrolls past the field: the frame holds still,
 * and anything marked `data-range="from,to"` (scene progress, 0..1) fades in
 * at `from` and out at `to`. A `to` above 1 never leaves. Inside one,
 * `data-tally="<n>"` counts up to n as it arrives.
 */
export function Scene({ id, length, marks = [], className = "", innerClassName = "", children }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-range]");
      if (items.length === 0) return;
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.set({}, {}, 1); // the timeline spans exactly the scene
      const fade = 0.07;
      for (const item of items) {
        const [from, to] = (item.dataset.range ?? "0,1").split(",").map(Number);
        const delay = Number(item.dataset.delay ?? 0);
        gsap.set(item, { opacity: 0, y: 22, filter: "blur(10px)" });
        tl.to(item, { opacity: 1, y: 0, filter: "blur(0px)", duration: fade }, Math.min(from + delay, 1 - fade));
        // Numbers count up with the scroll as they arrive.
        for (const tally of item.querySelectorAll<HTMLElement>("[data-tally]")) {
          const target = Number(tally.dataset.tally);
          const state = { v: 0 };
          tally.textContent = "0";
          tl.to(
            state,
            {
              v: target,
              duration: 0.16,
              ease: "power3.out",
              onUpdate: () => (tally.textContent = Math.round(state.v).toLocaleString("en-US")),
            },
            Math.min(from + delay, 1 - 0.16),
          );
        }
        if (to <= 1) {
          tl.to(item, { opacity: 0, y: -22, filter: "blur(10px)", duration: fade, ease: "power2.in" }, Math.max(to - fade, 0));
        }
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id={id} className={`relative ${className}`} style={{ height: `${length}svh` }}>
      {marks.map(([at, field]) => (
        <i
          key={`${at}-${field}`}
          aria-hidden
          data-field={field}
          className="pointer-events-none absolute left-0 h-0 w-0"
          style={{ top: `calc(50svh + ${at} * ${length - 100}svh)` }}
        />
      ))}
      <div className={`sticky top-0 h-svh overflow-hidden ${innerClassName}`}>{children}</div>
    </section>
  );
}
