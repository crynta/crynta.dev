"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { GitHub } from "./icons";
import { scrollToId } from "./motion";
import { OPEN_PALETTE } from "./palette";

const links = [
  { id: "activity", label: "activity" },
  { id: "terax", label: "terax" },
  { id: "zephium", label: "zephium" },
  { id: "stack", label: "stack" },
  { id: "contact", label: "contact" },
];

/**
 * Hides while you read downward and returns the moment you scroll back up.
 * Over the light part of the page it turns dark, and it marks where you are.
 */
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [light, setLight] = useState(false);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    let last = window.scrollY;
    const scroll = () => {
      const y = window.scrollY;
      if (y > 160 && y > last + 2) setHidden(true);
      else if (y < last - 2 || y <= 160) setHidden(false);
      last = y;
      setLight(
        Array.from(document.querySelectorAll("[data-light]")).some((el) => {
          const box = el.getBoundingClientRect();
          return box.top <= 40 && box.bottom >= 40;
        }),
      );
      const middle = window.innerHeight / 2;
      let here = "";
      for (const { id } of links) {
        const box = document.getElementById(id)?.getBoundingClientRect();
        if (box && box.top <= middle && box.bottom >= middle) here = id;
      }
      setCurrent(here);
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,color] duration-700 ease-out-expo ${light ? "text-ink" : "text-paper"} ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <nav className="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            scrollToId("top");
          }}
          className="group flex items-center gap-3 text-[15px] font-medium tracking-tight"
        >
          <Image
            src="/avatar.png"
            alt=""
            width={64}
            height={64}
            priority
            className={`size-8 rounded-full ring-1 transition-transform duration-700 ease-out-expo group-hover:scale-110 ${light ? "ring-ink/15" : "ring-paper/15"}`}
          />
          Crynta
        </a>

        <ul
          className={`hidden items-center gap-0.5 rounded-full border p-1 font-mono backdrop-blur-xl transition-colors duration-500 md:flex ${light ? "border-ink/10 bg-white/60" : "border-line bg-ink/45"}`}
        >
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToId(link.id);
                }}
                className={`block rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors duration-300 ${
                  current === link.id
                    ? light
                      ? "bg-ink/[0.07] text-ink"
                      : "bg-paper/[0.09] text-paper"
                    : light
                      ? "text-ink/55 hover:text-ink"
                      : "text-mute hover:text-paper"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={site.social.github}
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            className={`grid size-9 place-items-center rounded-full border backdrop-blur-xl transition-colors ${light ? "border-ink/10 bg-white/60 hover:border-ink/30" : "border-line bg-ink/45 hover:border-paper/30"}`}
          >
            <GitHub className="size-4" />
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))}
            aria-label="Open command menu"
            className={`h-9 rounded-full border px-3 font-mono text-[12px] backdrop-blur-xl transition-colors ${light ? "border-ink/10 bg-white/60 text-ink/70 hover:text-ink" : "border-line bg-ink/45 text-mute hover:text-paper"}`}
          >
            ⌘K
          </button>
        </div>
      </nav>
    </header>
  );
}
