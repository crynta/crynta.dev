"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { ArrowUpRight, Check, Copy, Discord, GitHub, Mail, XLogo, YouTube } from "../icons";
import { Scene } from "../scene";

const links = [
  { label: "GitHub", handle: "@crynta", href: site.social.github, icon: GitHub },
  { label: "X", handle: "@CryntaDev", href: site.social.x, icon: XLogo },
  { label: "YouTube", handle: "@crynta", href: site.social.youtube, icon: YouTube },
  { label: "Discord", handle: "community", href: site.social.discord, icon: Discord },
];

/** The field draws the formula once more; the address and the links sit beside it. */
export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(site.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Scene
      id="contact"
      length={220}
      marks={[
        [0, "3 0.8"],
        [0.62, "4 1"],
        [1, "4 1"],
      ]}
      innerClassName="flex flex-col justify-between px-5 pb-7 pt-28 md:px-10"
    >
      <div className="flex flex-1 items-center">
        <div className="w-full max-w-[600px]">
          <p data-range="0.46,2" className="mb-6 flex items-center gap-2 font-mono text-[13px] text-faint">
            <Mail className="size-4" />
            contact
          </p>
          <div data-range="0.5,2" className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href={`mailto:${site.email}`}
              className="text-[clamp(34px,4.6vw,68px)] font-semibold leading-none tracking-[-0.05em] transition-colors hover:text-white"
            >
              {site.email}
            </a>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy email address"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-paper/15 px-3.5 font-mono text-[12px] text-mute transition-colors hover:border-paper/40 hover:text-paper"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              <span aria-live="polite">{copied ? "copied" : "copy"}</span>
            </button>
          </div>

          <ul data-range="0.56,2" className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {links.map(({ label, handle, href, icon: I }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener"
                  className="group flex aspect-[1/1.05] flex-col justify-between rounded-[20px] border border-line bg-ink-2/80 p-4 backdrop-blur-md transition-[border-color,background-color,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:border-paper/25 hover:bg-[#111114]"
                >
                  <div className="flex items-start justify-between">
                    <I className="size-8 text-paper md:size-9" />
                    <ArrowUpRight className="size-4 text-faint transition-[color,transform] duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium tracking-tight">{label}</p>
                    <p className="font-mono text-[12px] text-faint">{handle}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer data-range="0.6,2" className="flex items-end justify-between font-mono text-[12px] text-faint">
        <span>© 2026 Crynta</span>
        <span>crynta.dev</span>
      </footer>
    </Scene>
  );
}
