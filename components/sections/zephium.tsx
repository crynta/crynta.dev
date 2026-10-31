"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { site } from "@/lib/site";
import { Apple, Disk, Download, Fork, GitHub, Globe, Layers, Monitor, Scale, Star, Windows } from "../icons";
import { gsap } from "../motion";
import { Scene } from "../scene";
import { AppIcon, Pill, Spec, Tech, fmt } from "./parts";

type Props = { stars: number; downloads: number; forks: number };

/**
 * Out of the dark and into Zephium's sky: the clouds open from the middle of
 * the screen, the camera falls through a bank of them, the name appears, and
 * the browser rises into the clear. The page then carries on in the light at
 * the bottom of the sky.
 */
export function Zephium({ stars, downloads, forks }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el.querySelector("#zephium"), start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      tl.set({}, {}, 1)
        .fromTo("[data-open]", { "--r": "0%" }, { "--r": "160%", duration: 0.34, ease: "power2.in" }, 0)
        .fromTo("[data-sky]", { scale: 1.75 }, { scale: 1.04, duration: 0.62, ease: "power2.out" }, 0)
        .fromTo("[data-fog]", { opacity: 0, scale: 2.2 }, { opacity: 0.95, scale: 2.8, duration: 0.14, ease: "power1.in" }, 0.06)
        .to("[data-fog]", { opacity: 0, scale: 5, duration: 0.26, ease: "power2.in" }, 0.2)
        .fromTo("[data-title]", { opacity: 0, scale: 0.9, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.14, ease: "power2.out" }, 0.3)
        .to("[data-title]", { opacity: 0, yPercent: -80, filter: "blur(10px)", duration: 0.14, ease: "power2.in" }, 0.58)
        .fromTo("[data-browser]", { yPercent: 105, scale: 0.9 }, { yPercent: 0, scale: 1, duration: 0.32, ease: "power3.out" }, 0.5);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      <Scene id="zephium" length={380} marks={[[0.22, "5 0"]]} className="z-10">
        <div data-open className="absolute inset-0 [--r:0%] [mask-image:radial-gradient(circle_at_50%_55%,#000_var(--r),transparent_calc(var(--r)+22%))]">
          <div data-sky className="absolute inset-0 origin-[50%_60%]">
            <Image src="/work/sky-day.jpg" alt="" fill sizes="100vw" className="object-cover" priority={false} />
          </div>
          <div data-fog aria-hidden className="absolute inset-0 origin-[30%_55%] opacity-0">
            <Image src="/work/sky-day-small.jpg" alt="" fill sizes="50vw" className="object-cover blur-[22px] brightness-[1.15] saturate-50" />
          </div>
          <div data-title className="absolute inset-x-0 top-[17svh] flex items-center justify-center gap-[0.2em] text-[clamp(56px,9vw,150px)] font-semibold tracking-[-0.06em] text-white [text-shadow:0_8px_40px_rgb(20_60_140/0.35)]">
            <Image src="/work/zephium-logo.png" alt="" width={192} height={192} className="size-[0.86em] rounded-[22.5%] shadow-[0_20px_50px_-10px_rgb(20_50_120/0.5)]" />
            <h2 className="leading-none">Zephium</h2>
          </div>
          <div data-browser className="absolute inset-x-0 bottom-[30svh] flex justify-center px-3 md:bottom-[5svh]">
            <div className="relative aspect-[1436/894] w-[min(94vw,1560px,calc(86svh*1.606))] overflow-hidden rounded-[1.4%/2.25%] shadow-[0_70px_140px_-30px_rgb(20_45_100/0.55),0_0_0_1px_rgb(255_255_255/0.35)]">
              <Image
                src="/work/zephium-window.jpg"
                alt="Zephium's new tab: the window opens onto a night sky, with tabs in the sidebar"
                fill
                sizes="(min-width: 1660px) 1560px, 94vw"
                className="scale-[1.006] object-cover"
              />
            </div>
          </div>
        </div>
      </Scene>

      <section id="zephium-more" data-light className="relative bg-[#f8f8f8] px-5 pb-[40svh] pt-[16svh] text-ink md:px-10">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-20">
          <div>
            <div data-fade className="mb-9 flex items-end gap-6">
              <AppIcon src="/work/zephium-logo.png" size={104} tone="light" />
              <div>
                <h3 className="text-[clamp(48px,5.4vw,84px)] font-semibold leading-[0.9] tracking-[-0.06em]">Zephium</h3>
                <p className="mt-2 font-mono text-[13px] text-ink/55">browser and work environment</p>
              </div>
            </div>
            <p data-fade className="mb-8 text-[16px] leading-relaxed text-ink/65">
              Written in Rust on the system&apos;s own engine, not a Chromium fork. Native ad and tracker blocking, Chrome
              extensions, and Work: a canvas where agents open real pages and leave the results.
            </p>
            <div data-fade>
              <Spec
                tone="light"
                rows={[
                  { icon: Layers, k: "stack", v: <><Tech id="rust" /><span className="ml-1">Rust · WebKit · WebView2</span></> },
                  { icon: Monitor, k: "platforms", v: <><Apple className="size-3.5" /><Windows className="size-3.5" /><span className="ml-1">macOS · Windows</span></> },
                  { icon: Disk, k: "size", v: "~30 MB" },
                  { icon: Scale, k: "license", v: "MPL-2.0" },
                  { icon: Star, k: "stars", v: fmt(stars) },
                  { icon: Download, k: "downloads", v: fmt(downloads) },
                  { icon: Fork, k: "forks", v: fmt(forks) },
                ]}
              />
            </div>
            <div data-fade className="mt-7 flex flex-wrap gap-3">
              <Pill href={site.zephium.url} icon={Globe} tone="light" primary>
                zephium.app
              </Pill>
              <Pill href={site.zephium.repo} icon={GitHub} tone="light">
                zephium-browser/Zephium
              </Pill>
            </div>
          </div>

          <figure data-fade className="self-center">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] shadow-[0_50px_120px_-40px_rgb(20_40_90/0.45),0_0_0_1px_rgb(0_0_0/0.06)]">
              <Image
                src="/work/zephium-run.jpg"
                alt="A Work run in Zephium: helpers reading three projects on their own sites, then a comparison, a diagram, the config and the tasks"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 font-mono text-[12px] text-ink/45">work</figcaption>
          </figure>
        </div>
        {/* Back into the dark. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34svh] bg-[linear-gradient(to_bottom,transparent,rgb(5_5_6/0.35)_35%,rgb(5_5_6/0.85)_70%,#050506)]" />
      </section>
    </div>
  );
}
