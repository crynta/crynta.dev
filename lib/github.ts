import { cacheLife } from "next/cache";
import snapshot from "./data/github.json";

export type Stats = typeof snapshot;
export type Commit = Stats["commits"][number];

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

  const [terax, zephium, teraxCommits, zephiumCommits] = await Promise.all([
    stars("crynta/terax-ai", snapshot.terax.stars),
    stars("zephium-browser/Zephium", snapshot.zephium.stars),
    commitsOf("crynta/terax-ai", "terax"),
    commitsOf("zephium-browser/Zephium", "zephium"),
  ]);
  const live = [...teraxCommits, ...zephiumCommits]
    .filter((c) => !c.message.startsWith("Merge "))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return {
    ...snapshot,
    terax: { ...snapshot.terax, stars: terax },
    zephium: { ...snapshot.zephium, stars: zephium },
    commits: live.length >= 4 ? live : snapshot.commits,
  };
}
