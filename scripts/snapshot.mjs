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

// YouTube: videos and views from the channel's public feed, subscribers from
// the channel page. Both need no key.
const CHANNEL = "UC59t7lAzjS0yA6HTk9Eg34A";
const feed = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`)).text();
const videos = [...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
  id: e.match(/<yt:videoId>([^<]+)/)[1],
  title: e.match(/<title>([^<]+)/)[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
  published: e.match(/<published>([^<]+)/)[1],
  views: Number(e.match(/views="(\d+)"/)?.[1] ?? 0),
}));
const page = await (
  await fetch("https://www.youtube.com/@crynta", { headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US" } })
).text();
const subscribers = page.match(/"content":"([\d.,]+[KM]?) subscribers"/)?.[1] ?? null;

const data = {
  takenAt: new Date().toISOString().slice(0, 10),
  followers: user.followers.totalCount,
  contributions: calendar.totalContributions,
  days: calendar.weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)),
  terax: repo("crynta/terax-ai"),
  zephium: repo("zephium-browser/Zephium"),
  commits,
  youtube: { subscribers, videos },
};
writeFileSync(new URL("../lib/data/github.json", import.meta.url), JSON.stringify(data) + "\n");
console.log({ ...data, days: data.days.length });
