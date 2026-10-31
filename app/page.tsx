import { Cursor } from "@/components/cursor";
import { Field } from "@/components/field/field";
import { Motion } from "@/components/motion";
import { Nav } from "@/components/nav";
import { Palette } from "@/components/palette";
import { About } from "@/components/sections/about";
import { Activity } from "@/components/sections/activity";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Identity } from "@/components/sections/identity";
import { Terax } from "@/components/sections/terax";
import { Zephium } from "@/components/sections/zephium";
import { getStats } from "@/lib/github";

export default async function Home() {
  const stats = await getStats();
  return (
    <>
      <Field days={stats.days} stars={stats.terax.stars} />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Identity />
        <Activity days={stats.days} contributions={stats.contributions} commits={stats.commits} />
        <Terax stars={stats.terax.stars} downloads={stats.terax.downloads} forks={stats.terax.forks} />
        <Zephium stars={stats.zephium.stars} downloads={stats.zephium.downloads} forks={stats.zephium.forks} />
        <About />
        <Contact />
      </main>
      <Palette />
      <Cursor />
      <Motion />
      <div className="grain" aria-hidden />
    </>
  );
}
