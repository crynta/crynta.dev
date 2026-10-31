import type { Commit } from "@/lib/github";
import { Bolt, Calendar, Commit as CommitIcon, Flame, GitHub } from "../icons";
import { Scene } from "../scene";
import { fmt } from "./parts";

type Props = { days: number[]; contributions: number; commits: Commit[] };

function measure(days: number[]) {
  let active = 0, streak = 0, best = 0, busiest = 0;
  for (const count of days) {
    if (count > 0) {
      active++;
      streak++;
      best = Math.max(best, streak);
    } else streak = 0;
    busiest = Math.max(busiest, count);
  }
  return { active, best, busiest };
}

const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** The last year on GitHub. The field draws it as a skyline, a column per week. */
export function Activity({ days, contributions, commits }: Props) {
  const { active, best, busiest } = measure(days);
  const legend = [
    { icon: Calendar, k: "active days", v: `${active} / ${days.length}` },
    { icon: Flame, k: "longest streak", v: `${best} days` },
    { icon: Bolt, k: "most in a day", v: fmt(busiest) },
  ];

  return (
    <Scene
      id="activity"
      length={300}
      marks={[
        [0.08, "2 1"],
        [0.92, "2 1"],
      ]}
      innerClassName="flex flex-col justify-between px-5 pb-8 pt-24 md:px-10 md:pt-28"
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div data-range="0.06,0.93">
          <div className="flex items-center gap-3 font-mono text-[13px] text-mute">
            <GitHub className="size-4 text-paper" />
            github.com/crynta
          </div>
          <p className="mt-5 text-[clamp(64px,10vw,168px)] font-semibold leading-[0.84] tracking-[-0.065em] tabular-nums">
            <span data-tally={contributions}>{fmt(contributions)}</span>
          </p>
          <p className="mt-4 text-[17px] tracking-tight text-mute md:text-[19px]">contributions in the last year</p>
        </div>

        <div
          data-range="0.12,0.93"
          className="hidden w-full max-w-[520px] overflow-hidden rounded-2xl border border-line bg-ink/55 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl md:block"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-[12px]">
            <span className="flex items-center gap-2 text-paper">
              <CommitIcon className="size-4 text-signal" />
              git log
            </span>
            <span className="text-faint">latest, by crynta</span>
          </div>
          <ol className="divide-y divide-line font-mono text-[12px]">
            {commits.slice(0, 6).map((c) => (
              <li key={c.sha} className="grid grid-cols-[58px_62px_1fr_auto] items-center gap-3 px-4 py-2.5">
                <span className="text-signal/90">{c.sha}</span>
                <span className="text-faint">{c.repo}</span>
                <span className="truncate text-paper/85">{c.message}</span>
                <span className="text-faint">{day(c.date)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div data-range="0.18,0.93" className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <dl className="flex flex-wrap gap-x-9 gap-y-3 font-mono text-[13px]">
          {legend.map(({ icon: I, k, v }) => (
            <div key={k} className="flex items-center gap-2.5">
              <I className="size-4 text-faint" />
              <dt className="text-faint">{k}</dt>
              <dd className="text-paper tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="flex items-center gap-2 font-mono text-[12px] text-faint">
          <span className="inline-block h-3 w-[5px] rounded-[1px] bg-paper/70" />
          one column per week
          <span className="ml-2 inline-block h-3 w-[5px] rounded-[1px] bg-signal" />
          the busiest
        </p>
      </div>
    </Scene>
  );
}
