import Image from "next/image";
import { site } from "@/lib/site";
import { Apple, Disk, Download, Fork, GitHub, Globe, Layers, Linux, Monitor, Scale, Star, Windows } from "../icons";
import { Scene } from "../scene";
import { AppIcon, Pill, Spec, Tech, fmt } from "./parts";

type Props = { stars: number; downloads: number; forks: number };

/**
 * The galaxy, one lit point per star, beside what Terax is. Then the points
 * leave the galaxy and lay themselves out as the terminal, pixel by pixel,
 * until the real screenshot settles over them.
 */
export function Terax({ stars, downloads, forks }: Props) {
  return (
    <Scene
      id="terax"
      length={460}
      marks={[
        [0.06, "3 1"],
        [0.4, "3 1"],
        [0.6, "5 1"],
        [1, "5 1"],
      ]}
      innerClassName="flex items-center px-5 md:px-10"
    >
      <div data-range="0.05,0.42" className="relative z-10 w-full max-w-[33rem]">
        <div className="mb-9 flex items-end gap-6">
          <AppIcon src="/work/terax-logo.png" size={104} />
          <div>
            <h2 className="text-[clamp(52px,6vw,92px)] font-semibold leading-[0.9] tracking-[-0.06em]">Terax</h2>
            <p className="mt-2 font-mono text-[13px] text-mute">terminal-first ai-native dev environment</p>
          </div>
        </div>
        <p className="mb-8 text-[16px] leading-relaxed text-mute">
          A native PTY behind a GPU-rendered terminal, an agent panel on your own keys or local models, an editor, git
          and a web preview. One window, about 8 MB.
        </p>
        <Spec
          rows={[
            { icon: Layers, k: "stack", v: <><Tech id="tauri" /><Tech id="rust" /><Tech id="react" /><span className="ml-1">Tauri 2 · Rust · React 19</span></> },
            { icon: Monitor, k: "platforms", v: <><Apple className="size-3.5" /><Linux className="size-3.5" /><Windows className="size-3.5" /><span className="ml-1">macOS · Linux · Windows</span></> },
            { icon: Disk, k: "size", v: "7–8 MB" },
            { icon: Scale, k: "license", v: "Apache-2.0" },
            { icon: Star, k: "stars", v: fmt(stars) },
            { icon: Download, k: "downloads", v: fmt(downloads) },
            { icon: Fork, k: "forks", v: fmt(forks) },
          ]}
        />
        <div className="mt-7 flex flex-wrap gap-3">
          <Pill href={site.terax.url} icon={Globe} primary>
            terax.app
          </Pill>
          <Pill href={site.terax.repo} icon={GitHub}>
            crynta/terax-ai
          </Pill>
        </div>
      </div>

      <p data-range="0.1,0.42" className="absolute bottom-8 right-5 hidden items-center gap-2 font-mono text-[12px] text-faint md:right-10 md:flex">
        <Star className="size-3.5" />
        {fmt(stars)} points, one for every star
      </p>

      {/* Laid out in exactly the box the field draws the picture in. */}
      <div data-range="0.74,0.97" className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="relative aspect-[2400/1320] w-[min(86vw,calc(74svh*1.818))] overflow-hidden rounded-[10px] shadow-[0_0_0_1px_rgb(242_239_232/0.1),0_60px_160px_-40px_rgb(0_0_0/0.95)]">
          <Image
            src="/work/terax-terminal.jpg"
            alt="Terax: file tree, block-based terminal running fastfetch, and the command input"
            fill
            sizes="86vw"
            className="object-cover"
          />
        </div>
      </div>
    </Scene>
  );
}
