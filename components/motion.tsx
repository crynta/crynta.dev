"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Splits an element's text into masked words, once. */
function split(element: HTMLElement) {
  if (element.dataset.splitDone) return element.querySelectorAll<HTMLElement>(".word-mask > span");
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? "").split(/(\s+)/);
        const fragment = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) fragment.append(" ");
          else {
            const mask = document.createElement("span");
            mask.className = "word-mask";
            const inner = document.createElement("span");
            inner.textContent = part;
            mask.append(inner);
            fragment.append(mask);
          }
        }
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && !(child as HTMLElement).matches("br")) {
        walk(child);
      }
    }
  };
  walk(element);
  element.dataset.splitDone = "";
  return element.querySelectorAll<HTMLElement>(".word-mask > span");
}

const format = (value: number) => Math.round(value).toLocaleString("en-US");

/**
 * Smooth scroll, and the page's shared motion vocabulary:
 * - [data-rise]        words rise out of their masks when the element is reached
 * - [data-read]        words brighten one by one as the element scrolls through
 * - [data-count]       a number counts up to its value when reached
 * - [data-fade]        fades and lifts in
 * - [data-speed]       moves at its own speed against the scroll
 */
export function Motion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Touch keeps the system's own scrolling: smoothing it only fights the finger.
    const fine = window.matchMedia("(pointer: fine)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true });
    const lenis = reduced || !fine ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 1.05 });
    if (lenis) {
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      if (reduced) return;

      for (const el of gsap.utils.toArray<HTMLElement>("[data-rise]")) {
        if (el.closest("[data-hero]")) continue; // the hero runs its own entrance
        const words = split(el);
        gsap.from(words, {
          yPercent: 110,
          rotate: 4,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      }

      for (const el of gsap.utils.toArray<HTMLElement>("[data-read]")) {
        const words = split(el);
        gsap.fromTo(
          words,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.6 },
          },
        );
      }

      for (const el of gsap.utils.toArray<HTMLElement>("[data-count]")) {
        const to = Number(el.dataset.count);
        const state = { value: 0 };
        el.textContent = format(0);
        gsap.to(state, {
          value: to,
          duration: 2.2,
          ease: "expo.out",
          onUpdate: () => (el.textContent = format(state.value)),
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      }

      for (const el of gsap.utils.toArray<HTMLElement>("[data-fade]")) {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: "expo.out",
          delay: Number(el.dataset.fade) || 0,
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      }

      for (const el of gsap.utils.toArray<HTMLElement>("[data-speed]")) {
        const speed = Number(el.dataset.speed);
        gsap.to(el, {
          yPercent: speed * -100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    });

    // Fonts and images change heights; measure again once they settle.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      ctx.revert();
      lenis?.destroy();
      window.removeEventListener("load", refresh);
      delete window.__lenis;
    };
  }, []);

  return null;
}

export { split, gsap, ScrollTrigger };

/** Scrolls to a section through Lenis when it is running. */
export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else target.scrollIntoView({ behavior: "smooth" });
}
