/** Iconos SVG inline — sin dependencias externas. */
import type { SVGProps } from "react";

type Icon = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const base: SVGProps<SVGSVGElement> = {
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.8,
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const MenuIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
  </svg>
);

export const CloseIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const ChevronLeft: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

export const ChevronRight: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

export const CheckIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

export const LockIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75" />
    <rect x="4.5" y="10.5" width="15" height="9.75" rx="2" />
  </svg>
);

export const MailIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="2.25" y="4.5" width="19.5" height="15" rx="2" />
    <path d="m3 6 9 6 9-6" />
  </svg>
);

export const CalendarIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
    <path d="M3.5 9h17M8 3v3M16 3v3" />
  </svg>
);

export const HeartIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

export const SparkIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

export const ChevronDown: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const PrayingHands: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v8" />
    <path d="M9 11V6.5a1.5 1.5 0 0 0-3 0V13c0 1.2.4 2.3 1.2 3.2L9 18.5" />
    <path d="M15 11V6.5a1.5 1.5 0 0 1 3 0V13c0 1.2-.4 2.3-1.2 3.2L15 18.5" />
    <path d="M9 18.5h6V21H9z" />
  </svg>
);

export const PlayIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.5-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
  </svg>
);

export const MusicIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const MapPinIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const YoutubeIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M23.5 6.2a3 3 0 0 0-2.11-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.39.57A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.39-.57A3 3 0 0 0 23.5 17.8 31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
  </svg>
);

export const FacebookIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
  </svg>
);

export const InstagramIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const TiktokIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.5-.9v6.1c0 3.3-2.4 5.3-5.2 5.3-2.7 0-4.8-2-4.8-4.7 0-2.9 2.4-4.9 5.4-4.6v2.7c-.4-.1-.9-.2-1.3-.1-1.1.2-1.8 1-1.7 2.1.1 1 .9 1.7 1.9 1.7 1.1 0 1.9-.8 1.9-2.1V3h3.3Z" />
  </svg>
);
