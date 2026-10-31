# crynta.dev

Crynta's personal site. Next.js 16 (Cache Components), Tailwind 4, Three.js with
`postprocessing`, GSAP ScrollTrigger and Lenis.

- `pnpm dev`: run locally
- `pnpm build`: production build (the page is static and revalidates hourly)
- `node scripts/snapshot.mjs`: refresh `lib/data/github.json` (contributions,
  stars, downloads, latest commits, followers) from GitHub, and the YouTube
  channel (subscribers, videos, views) from its public feed. Needs `gh` signed in. Run it before a deploy
  to keep the contribution skyline and download counts current.

Stars, followers, the latest commits and the YouTube channel are also read
live, once an hour. On Vercel, set `GITHUB_TOKEN` (any
read-only token) so those reads are not rate-limited; without it the site
falls back to the snapshot.

## How the page works

One particle field (`components/field`) sits behind the whole page. Wherever
it is visible the page is a pinned `Scene` (`components/scene.tsx`): the frame
holds still, its text fades in and out at set points of its progress
(`data-range`), and its `marks` say which shape the field takes where:

| shape | what |
| --- | --- |
| 0 | the Gaussian surface (hero) |
| 1 | the avatar's formula over "Crynta", sampled from `public/avatar.png` |
| 2 | last year's contributions, a column per week |
| 3 | a galaxy with one lit point per Terax star |
| 4 | the formula alone (contact) |
| 5 | the Terax terminal as a dot matrix, in the screenshot's colours |

Shared scroll motion lives in `components/motion.tsx` (`data-rise`,
`data-read`, `data-count`, `data-fade`, `data-speed`). Stack icons in
`public/stack` come from skillicons.dev, as in the GitHub profile README..
