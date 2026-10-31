import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowUpRight } from "../icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export const fmt = (n: number) => n.toLocaleString("en-US");

/** Key and value, as a manifest would list them, each with its icon. */
export function Spec({
  rows,
  tone = "dark",
}: {
  rows: { icon: Icon; k: string; v: ReactNode }[];
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <dl className={`border-t font-mono text-[13px] ${light ? "border-ink/10" : "border-line"}`}>
      {rows.map(({ icon: I, k, v }) => (
        <div
          key={k}
          className={`grid grid-cols-[20px_104px_1fr] items-center gap-3 border-b py-[11px] md:grid-cols-[20px_128px_1fr] ${light ? "border-ink/10" : "border-line"}`}
        >
          <I className={`size-4 ${light ? "text-ink/40" : "text-faint"}`} />
          <dt className={light ? "text-ink/50" : "text-faint"}>{k}</dt>
          <dd className={`flex items-center gap-2 tabular-nums ${light ? "text-ink" : "text-paper/90"}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A pill that leaves the site, with an icon in front and an arrow that slides out on hover. */
export function Pill({
  href,
  icon: I,
  children,
  tone = "dark",
  primary = false,
}: {
  href: string;
  icon?: Icon;
  children: ReactNode;
  tone?: "dark" | "light";
  primary?: boolean;
}) {
  const look = primary
    ? tone === "light"
      ? "bg-ink text-paper hover:bg-ink/85"
      : "bg-paper text-ink hover:bg-white"
    : tone === "light"
      ? "border border-ink/15 text-ink hover:border-ink/40"
      : "border border-paper/15 text-paper hover:border-paper/40";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`group inline-flex h-10 items-center gap-2 rounded-full pl-3.5 pr-3 font-mono text-[13px] transition-colors duration-300 ${look}`}
    >
      {I && <I className="size-4" />}
      {children}
      <span className="relative grid size-3.5 overflow-hidden opacity-60">
        <ArrowUpRight className="col-start-1 row-start-1 size-3.5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-4 group-hover:translate-x-4" />
        <ArrowUpRight className="col-start-1 row-start-1 size-3.5 -translate-x-4 translate-y-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </a>
  );
}

/** An app icon at full size, lit from below like it sits on a desk. */
export function AppIcon({ src, size = 112, tone = "dark" }: { src: string; size?: number; tone?: "dark" | "light" }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        aria-hidden
        className={`absolute inset-x-[12%] -bottom-[18%] h-[40%] rounded-full blur-2xl ${tone === "light" ? "bg-ink/25" : "bg-paper/15"}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} className="relative size-full rounded-[22.5%] shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]" />
    </div>
  );
}

/** A stack icon at text size, from the same set as the stack section. */
export function Tech({ id }: { id: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/stack/${id}.svg`} alt="" width={16} height={16} className="size-4 rounded-[4px]" />;
}
