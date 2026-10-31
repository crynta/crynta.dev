import { Scene } from "../scene";

/** The field draws the avatar: the formula over the name. */
export function Identity() {
  return (
    <Scene
      length={230}
      marks={[
        [0.08, "1 1"],
        [0.92, "1 1"],
      ]}
      innerClassName="flex items-end justify-center px-5 pb-[9svh] md:px-10"
    >
      <p data-range="0.16,0.9" className="max-w-[44ch] text-center text-[15px] leading-relaxed text-mute md:text-[16px]">
        Software &amp; AI engineer. Writing code every day for 5+ years.
        <br className="hidden md:block" /> Building open source: <span className="text-paper">Terax</span> and{" "}
        <span className="text-paper">Zephium</span>.
      </p>
    </Scene>
  );
}
