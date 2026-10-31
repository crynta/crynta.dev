"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { scrollToId } from "./motion";
import { site } from "@/lib/site";

type Item = { group: string; title: string; hint: string; run: () => void };

export const OPEN_PALETTE = "crynta:palette";

/** ⌘K: every place on the page and everywhere else Crynta is, one keystroke away. */
export function Palette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => scrollToId(id);
    const open = (url: string) => () => window.open(url, "_blank", "noopener");
    return [
      { group: "go to", title: "Top", hint: "#top", run: go("top") },
      { group: "go to", title: "Activity", hint: "#activity", run: go("activity") },
      { group: "go to", title: "Terax", hint: "#terax", run: go("terax") },
      { group: "go to", title: "Zephium", hint: "#zephium", run: go("zephium") },
      { group: "go to", title: "Stack", hint: "#stack", run: go("stack") },
      { group: "go to", title: "Contact", hint: "#contact", run: go("contact") },
      {
        group: "do",
        title: "Copy email",
        hint: site.email,
        run: () => {
          navigator.clipboard?.writeText(site.email);
          setCopied(true);
        },
      },
      { group: "open", title: "terax.app", hint: "↗", run: open(site.terax.url) },
      { group: "open", title: "zephium.app", hint: "↗", run: open(site.zephium.url) },
      { group: "open", title: "GitHub", hint: "@crynta", run: open(site.social.github) },
      { group: "open", title: "X", hint: "@CryntaDev", run: open(site.social.x) },
      { group: "open", title: "YouTube", hint: "@crynta", run: open(site.social.youtube) },
      { group: "open", title: "Discord", hint: "discord.gg", run: open(site.social.discord) },
    ];
  }, []);

  const shown = items.filter((item) =>
    `${item.group} ${item.title} ${item.hint}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    const show = () => {
      setQuery("");
      setActive(0);
      setCopied(false);
      setOpen(true);
    };
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (document.querySelector("[data-palette-open]")) setOpen(false);
        else show();
      } else if (event.key === "Escape") setOpen(false);
    };
    const request = () => show();
    window.addEventListener("keydown", key);
    window.addEventListener(OPEN_PALETTE, request);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener(OPEN_PALETTE, request);
    };
  }, []);

  useEffect(() => {
    if (open) {
      window.__lenis?.stop();
      requestAnimationFrame(() => input.current?.focus());
    } else window.__lenis?.start();
  }, [open]);

  const choose = (item: Item | undefined) => {
    if (!item) return;
    item.run();
    if (item.title !== "Copy email") setOpen(false);
  };

  let lastGroup = "";
  return (
    <div
      className={`fixed inset-0 z-[75] flex items-start justify-center px-4 pt-[18vh] transition-[opacity,visibility] duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      onPointerDown={(event) => event.target === event.currentTarget && setOpen(false)}
      role="dialog"
      {...(open ? { "data-palette-open": "" } : {})}
      aria-modal="true"
      aria-label="Command menu"
    >
      <div className="pointer-events-none absolute inset-0 bg-ink/60 backdrop-blur-md" />
      <div
        className={`relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-[#0e0e10]/90 shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl transition-transform duration-500 ease-out-expo ${open ? "translate-y-0 scale-100" : "-translate-y-3 scale-[0.98]"}`}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <span className="font-mono text-[14px] text-signal">❯</span>
          <input
            ref={input}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(shown.length - 1, value + 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(0, value - 1));
              } else if (event.key === "Enter") choose(shown[active]);
            }}
            placeholder="go to…"
            className="h-14 flex-1 bg-transparent text-[15px] text-paper outline-none placeholder:text-faint"
          />
          <kbd className="tag rounded-md border border-line px-1.5 py-0.5 text-[11px]">esc</kbd>
        </div>
        <ul className="max-h-[52vh] overflow-y-auto p-2" data-lenis-prevent>
          {shown.length === 0 && <li className="tag px-3 py-6 text-center">no matches</li>}
          {shown.map((item, index) => {
            const heading = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={`${item.group}-${item.title}`}>
                {heading && <p className="tag px-3 pb-1.5 pt-3 text-[11px]">{heading}</p>}
                <button
                  type="button"
                  onPointerMove={() => setActive(index)}
                  onClick={() => choose(item)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${index === active ? "bg-paper/[0.07] text-paper" : "text-mute"}`}
                >
                  <span>{item.title === "Copy email" && copied ? "Copied" : item.title}</span>
                  <span className="font-mono text-[11px] text-faint">{item.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
