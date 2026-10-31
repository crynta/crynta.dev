import { cacheLife } from "next/cache";
import snapshot from "./data/github.json";

export type Video = (typeof snapshot)["youtube"]["videos"][number];
export type Channel = { subscribers: string | null; videos: Video[] };
export type Stats = Omit<typeof snapshot, "youtube"> & { youtube: Channel };
export type Commit = Stats["commits"][number];

const CHANNEL = "UC59t7lAzjS0yA6HTk9Eg34A";

/** The channel's public feed and page; no key needed. Null when YouTube says no. */
async function youtube(): Promise<Channel | null> {
  try {
    const signal = AbortSignal.timeout(4000);
    const feed = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`, { signal })).text();
    const decode = (t: string) =>
      t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    const videos = [...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
      id: e.match(/<yt:videoId>([^<]+)/)?.[1] ?? "",
      title: decode(e.match(/<title>([^<]+)/)?.[1] ?? ""),
      published: e.match(/<published>([^<]+)/)?.[1] ?? "",
      views: Number(e.match(/views="(\d+)"/)?.[1] ?? 0),
    }));
    if (videos.length === 0 || videos.some((v) => !v.id)) return null;
    let subscribers: string | null = null;
    try {
      const page = await (
        await fetch("https://www.youtube.com/@crynta", {
          headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US" },
          signal: AbortSignal.timeout(4000),
        })
      ).text();
      subscribers = page.match(/"content":"([\d.,]+[KM]?) subscribers"/)?.[1] ?? null;
    } catch {}
    return { subscribers, videos };
  } catch {
    return null;
  }
}

const headers = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function read<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`https://api.github.com/${path}`, { headers, signal: AbortSignal.timeout(3000) });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

/**
 * The GitHub numbers the page shows. Contributions and downloads come from the
 * snapshot (scripts/snapshot.mjs); stars and the latest commits are read live
 * once an hour, and fall back to the snapshot whenever GitHub says no.
 */
export async function getStats(): Promise<Stats> {
  "use cache";
  cacheLife("hours");

  const stars = async (repo: string, fallback: number) => {
    const body = await read<{ stargazers_count?: number }>(`repos/${repo}`);
    return Math.max(body?.stargazers_count ?? 0, fallback);
  };

  type Raw = { sha: string; commit: { message: string; author: { date: string } } };
  const commitsOf = async (repo: string, name: string) =>
    ((await read<Raw[]>(`repos/${repo}/commits?author=crynta&per_page=30`)) ?? []).map((c) => ({
      sha: c.sha.slice(0, 7),
      repo: name,
      message: c.commit.message.split("\n")[0],
      date: c.commit.author.date,
    }));

  const [terax, zephium, teraxCommits, zephiumCommits, tube, user] = await Promise.all([
    stars("crynta/terax-ai", snapshot.terax.stars),
    stars("zephium-browser/Zephium", snapshot.zephium.stars),
    commitsOf("crynta/terax-ai", "terax"),
    commitsOf("zephium-browser/Zephium", "zephium"),
    youtube(),
    read<{ followers?: number }>("users/crynta"),
  ]);
  const live = [...teraxCommits, ...zephiumCommits]
    .filter((c) => !c.message.startsWith("Merge "))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return {
    ...snapshot,
    followers: Math.max(user?.followers ?? 0, snapshot.followers),
    terax: { ...snapshot.terax, stars: terax },
    zephium: { ...snapshot.zephium, stars: zephium },
    commits: live.length >= 4 ? live : snapshot.commits,
    youtube: {
      subscribers: tube?.subscribers ?? snapshot.youtube.subscribers,
      videos: tube?.videos ?? snapshot.youtube.videos,
    },
  };
}
