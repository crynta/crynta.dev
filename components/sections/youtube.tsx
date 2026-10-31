import Image from "next/image";
import type { Video } from "@/lib/github";
import { site } from "@/lib/site";
import { YouTube as YouTubeIcon } from "../icons";
import { Pill, fmt } from "./parts";

type Props = { subscribers: string | null; videos: Video[] };

const when = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const short = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K` : String(n));

/** The channel: what gets built, filmed. */
export function YouTube({ subscribers, videos }: Props) {
  const views = videos.reduce((sum, v) => sum + v.views, 0);
  const [latest, ...rest] = videos;

  return (
    <section id="youtube" className="relative px-5 pb-[10svh] pt-[14svh] md:px-10">
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div data-fade>
          <div className="mb-5 flex items-center gap-3">
            <YouTubeIcon className="size-9 text-[#ff0033]" />
            <span className="font-mono text-[13px] text-mute">@crynta</span>
          </div>
          <h2 className="text-[clamp(44px,5vw,76px)] font-semibold leading-none tracking-[-0.055em]">YouTube</h2>
        </div>
        <div data-fade className="flex flex-wrap items-end gap-x-10 gap-y-5">
          {[
            ...(subscribers ? [{ v: subscribers, k: "subscribers" }] : []),
            { v: fmt(views), k: "views" },
            { v: String(videos.length), k: "videos" },
          ].map((s) => (
            <div key={s.k}>
              <p className="text-[clamp(28px,2.6vw,40px)] font-semibold leading-none tracking-[-0.04em] tabular-nums">{s.v}</p>
              <p className="mt-2 font-mono text-[12px] text-faint">{s.k}</p>
            </div>
          ))}
          <Pill href={site.social.youtube} icon={YouTubeIcon} primary>
            subscribe
          </Pill>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {latest && <Card video={latest} big />}
        <div className="grid gap-4">
          {rest.slice(0, 3).map((video) => (
            <Card key={video.id} video={video} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ video, big = false }: { video: Video; big?: boolean }) {
  return (
    <a
      data-fade
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener"
      className={`group relative overflow-hidden rounded-[20px] border border-line bg-ink-2 transition-colors duration-500 hover:border-paper/20 ${
        big ? "block" : "grid grid-cols-[minmax(0,44%)_1fr] items-center"
      }`}
    >
      <div className={`relative overflow-hidden ${big ? "aspect-video" : "aspect-video rounded-l-[19px]"}`}>
        <Image
          src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
          alt=""
          fill
          sizes={big ? "(min-width: 1024px) 56vw, 100vw" : "(min-width: 1024px) 18vw, 44vw"}
          className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-paper/90 text-ink opacity-0 backdrop-blur transition-[opacity,transform] duration-500 ease-out-expo group-hover:scale-100 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="ml-0.5 size-5" fill="currentColor" aria-hidden>
            <path d="M8 5.5v13l11-6.5-11-6.5Z" />
          </svg>
        </span>
      </div>
      <div className={big ? "p-5 md:p-6" : "p-4 md:p-5"}>
        <p className={`font-medium leading-snug tracking-tight ${big ? "text-[20px] md:text-[24px]" : "line-clamp-2 text-[15px]"}`}>
          {video.title}
        </p>
        <p className="mt-2 font-mono text-[12px] text-faint">
          {short(video.views)} views · {when(video.published)}
        </p>
      </div>
    </a>
  );
}
