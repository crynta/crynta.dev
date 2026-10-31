"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "../motion";

/**
 * The curve, and under its peak the avatar and the name. Scrolling on, they
 * rise and dissolve while the field gathers the curve into the formula.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ delay: 0.25, defaults: { ease: "expo.out" } });
      intro
        .fromTo("[data-avatar]", { scale: 0.6, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.8 })
        .fromTo("[data-ring]", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.2 }, 0.2)
        .fromTo("[data-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.4, stagger: 0.08 }, 0.35)
        .fromTo("[data-hint]", { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1.2);

      gsap.to("[data-block]", {
        y: () => -window.innerHeight * 0.32,
        opacity: 0,
        filter: "blur(12px)",
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "75% top", scrub: true },
      });
      gsap.to("[data-hint]", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "15% top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="top" data-field="0 1" className="relative flex h-svh min-h-[600px] items-end justify-center overflow-hidden">
      <div data-block className="relative mb-[13svh] flex flex-col items-center">
        {/* A pool of dark behind the block, so the field never fights the name. */}
        <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[150%] w-[180%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(5_5_6/0.82),transparent)]" />
        <div className="relative">
          <div
            data-ring
            aria-hidden
            className="absolute -inset-3 rounded-full border border-paper/10 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          />
          <div
            data-ring
            aria-hidden
            className="absolute -inset-7 rounded-full border border-paper/[0.05] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
          />
          <Image
            data-avatar
            src="/avatar.png"
            alt="Crynta"
            width={240}
            height={240}
            priority
            className="relative size-[104px] rounded-full shadow-[0_0_0_1px_rgb(242_239_232/0.14),0_24px_60px_-12px_rgb(0_0_0/0.9),0_0_80px_-10px_rgb(242_239_232/0.18)] md:size-[120px]"
          />
        </div>
        <h1 className="mt-8 overflow-clip pb-1 text-[40px] font-semibold leading-none tracking-[-0.045em] md:text-[52px]">
          <span data-line className="inline-block">
            Crynta
          </span>
        </h1>
        <p className="mt-3 overflow-clip font-mono text-[13px] text-mute">
          <span data-line className="inline-block">
            software &amp; ai engineer
          </span>
        </p>
      </div>
      <div data-hint aria-hidden className="absolute bottom-7 left-1/2 h-10 w-px -translate-x-1/2 overflow-hidden bg-paper/10">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-[drip_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-paper/70" />
      </div>
    </section>
  );
}
