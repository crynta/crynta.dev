import { siApple, siDiscord, siGithub, siLinux, siX, siYoutube } from "simple-icons";
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Brand({ path, ...props }: P & { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d={path} />
    </svg>
  );
}

export const GitHub = (p: P) => <Brand path={siGithub.path} {...p} />;
export const XLogo = (p: P) => <Brand path={siX.path} {...p} />;
export const YouTube = (p: P) => <Brand path={siYoutube.path} {...p} />;
export const Discord = (p: P) => <Brand path={siDiscord.path} {...p} />;
export const Apple = (p: P) => <Brand path={siApple.path} {...p} />;
export const Linux = (p: P) => <Brand path={siLinux.path} {...p} />;
export const Windows = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M3 5.1 10.4 4v7.2H3V5.1Zm0 13.8 7.4 1.1v-7.1H3v6Zm8.3 1.2L21 21.5v-8.6h-9.7v7.2Zm0-16.2v7.3H21V2.5l-9.7 1.4Z" />
  </svg>
);

/** Line icons, drawn on one 24px grid with one stroke. */
function Line({ children, ...props }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {children}
    </svg>
  );
}

export const Star = (p: P) => (
  <Line {...p}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
  </Line>
);
export const Download = (p: P) => (
  <Line {...p}>
    <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
  </Line>
);
export const Fork = (p: P) => (
  <Line {...p}>
    <circle cx="6" cy="5.5" r="2" />
    <circle cx="18" cy="5.5" r="2" />
    <circle cx="12" cy="18.5" r="2" />
    <path d="M6 7.5v1.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.5M12 12v4.5" />
  </Line>
);
export const Scale = (p: P) => (
  <Line {...p}>
    <path d="M12 4v16M7 20h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0L5 7Zm14 0-2.5 6a3 3 0 0 0 5 0L19 7Z" />
  </Line>
);
export const Disk = (p: P) => (
  <Line {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
    <path d="M3.5 14h17M7.5 16.5h.01" />
  </Line>
);
export const Layers = (p: P) => (
  <Line {...p}>
    <path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z" />
    <path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" />
  </Line>
);
export const Monitor = (p: P) => (
  <Line {...p}>
    <rect x="3" y="4.5" width="18" height="12" rx="2" />
    <path d="M9 20h6M12 16.5V20" />
  </Line>
);
export const Calendar = (p: P) => (
  <Line {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Line>
);
export const Flame = (p: P) => (
  <Line {...p}>
    <path d="M12 21a6 6 0 0 0 6-6c0-3.5-2.5-5.5-3.5-8.5-.5 2-1.5 3-2.5 3.5C12 7 10.5 5 9 3c0 4-3 6.5-3 12a6 6 0 0 0 6 6Z" />
  </Line>
);
export const Bolt = (p: P) => (
  <Line {...p}>
    <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />
  </Line>
);
export const Commit = (p: P) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M3 12h5.5M15.5 12H21" />
  </Line>
);
export const Copy = (p: P) => (
  <Line {...p}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
    <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
  </Line>
);
export const Check = (p: P) => (
  <Line {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Line>
);
export const ArrowUpRight = (p: P) => (
  <Line {...p}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </Line>
);
export const Globe = (p: P) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5Z" />
  </Line>
);
export const Mail = (p: P) => (
  <Line {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Line>
);
