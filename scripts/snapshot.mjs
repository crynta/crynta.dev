// Snapshots the GitHub facts the site shows (contributions, stars) into
// lib/data/github.json, so the page always has real numbers even when the
// live read fails. Run: `node scripts/snapshot.mjs` (needs `gh` signed in).
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const gh = (args) => JSON.parse(execFileSync("gh", args, { encoding: "utf8" }));

const query = `query { user(login: "crynta") {
  followers { totalCount }
  contributionsCollection { contributionCalendar { totalContributions
    weeks { contributionDays { date contributionCount } } } } } }`;
const user = gh(["api", "graphql", "-f", `query=${query}`]).data.user;
const calendar = user.contributionsCollection.contributionCalendar;

const repo = (name) => {
  const r = gh(["api", `repos/${name}`]);
  const releases = gh(["api", `repos/${name}/releases?per_page=100`]);
  const downloads = releases
    .flatMap((release) => release.assets)
    .reduce((sum, asset) => sum + asset.download_count, 0);
  return { stars: r.stargazers_count, forks: r.forks_count, downloads, since: r.created_at.slice(0, 10) };
};

// The latest commits across both projects, merges left out.
const commits = ["zephium-browser/Zephium", "crynta/terax-ai"]
  .flatMap((name) =>
    gh(["api", `repos/${name}/commits?author=crynta&per_page=30`]).map((c) => ({
      sha: c.sha.slice(0, 7),
      repo: name.split("/")[1].toLowerCase().replace("-ai", ""),
      message: c.commit.message.split("\n")[0],
      date: c.commit.author.date,
    })),
  )
  .filter((c) => !c.message.startsWith("Merge "))
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 8);

const data = {
  takenAt: new Date().toISOString().slice(0, 10),
  followers: user.followers.totalCount,
  contributions: calendar.totalContributions,
  days: calendar.weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)),
  terax: repo("crynta/terax-ai"),
  zephium: repo("zephium-browser/Zephium"),
  commits,
};
writeFileSync(new URL("../lib/data/github.json", import.meta.url), JSON.stringify(data) + "\n");
console.log({ ...data, days: data.days.length });
