const stack = [
  { id: "ts", name: "TypeScript" },
  { id: "rust", name: "Rust" },
  { id: "py", name: "Python" },
  { id: "react", name: "React" },
  { id: "nextjs", name: "Next.js" },
  { id: "svelte", name: "Svelte" },
  { id: "tauri", name: "Tauri" },
  { id: "wasm", name: "WebAssembly" },
  { id: "fastapi", name: "FastAPI" },
  { id: "docker", name: "Docker" },
  { id: "kubernetes", name: "Kubernetes" },
  { id: "redis", name: "Redis" },
  { id: "arch", name: "Arch Linux" },
];

const before = ["Fintech", "AI startups", "Metadata editor for photographers"];

/** What it's built with, and what came before. */
export function About() {
  return (
    <section id="stack" className="relative px-5 pb-[12svh] pt-[16svh] md:px-10">
      <h2 data-fade className="mb-14 text-[clamp(44px,5vw,76px)] font-semibold leading-none tracking-[-0.055em]">
        Stack
      </h2>

      <ul className="group/stack grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {stack.map((tool, i) => (
          <li
            key={tool.id}
            data-fade={(i % 7) * 0.05}
            className="group relative flex aspect-square flex-col items-center justify-center gap-4 overflow-hidden rounded-[22px] border border-line bg-ink-2 transition-[opacity,border-color,background-color] duration-500 hover:border-paper/20 hover:bg-[#101013] group-hover/stack:opacity-45 hover:!opacity-100"
          >
            {/* The icon's own colour, blurred, behind it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              aria-hidden
              src={`/stack/${tool.id}.svg`}
              alt=""
              className="absolute left-1/2 top-[42%] size-24 -translate-x-1/2 -translate-y-1/2 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-50"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/stack/${tool.id}.svg`}
              alt=""
              width={72}
              height={72}
              className="relative size-[52px] transition-transform duration-700 ease-out-expo group-hover:-translate-y-1 group-hover:scale-110 md:size-[64px]"
            />
            <span className="relative font-mono text-[11px] text-faint transition-colors group-hover:text-paper md:text-[12px]">
              {tool.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-[14svh] grid gap-6 border-t border-line pt-8 md:grid-cols-[200px_1fr]">
        <p data-fade className="font-mono text-[13px] text-faint">
          previously
        </p>
        <ul className="flex flex-wrap gap-x-10 gap-y-3 text-[18px] tracking-tight text-mute">
          {before.map((item) => (
            <li key={item} data-fade>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
