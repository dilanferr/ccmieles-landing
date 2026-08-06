/** Iconos SVG inline — sin dependencias externas. */
import type { SVGProps } from "react";

export type Icon = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

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

// Iconos de ministerios (reemplazan a los emojis).
export const ChurchIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 2v4M10 4h4" />
    <path d="M12 6 4.5 11v10h15V11L12 6Z" />
    <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
  </svg>
);

export const MegaphoneIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 4 8 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4l12 5V4Z" />
    <path d="M8 15v3a2 2 0 0 0 4 0v-1" />
  </svg>
);

export const DeviceIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);

export const UsersIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M20.5 20a5.5 5.5 0 0 0-4-5.3" />
  </svg>
);

export const DownloadIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v12" />
    <path d="m7 12 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

export const ChartIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 21h18" />
    <path d="M7 21V11M12 21V7M17 21V14" />
  </svg>
);

export const SearchIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const CogIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const SunIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const GridIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const TrashIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

export const ImageIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

export const FlameIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3s5 3.4 5 9a5 5 0 0 1-10 0c0-2.4 1.4-4 2.6-5 .3 1.3 1 2.1 2 2.6C12 7.2 11 5.2 12 3Z" />
  </svg>
);

export const VideoIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="6" width="12" height="12" rx="2" />
    <path d="m15 10 6-3v10l-6-3" />
  </svg>
);

export const CameraIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
);

export const CodeIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />
  </svg>
);

export const PaletteIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.6-1.4-.4-.4-.6-.9-.6-1.4 0-1.1.9-2 2-2h1.2A4.8 4.8 0 0 0 21 9.4C21 5.9 16.9 3 12 3Z" />
    <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const GlobeIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
  </svg>
);

export const SignalIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="2" />
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 19.1a10 10 0 0 0 0-14.2" />
  </svg>
);

export const RocketIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3c3 1 6 4 6 9l-3 3H9l-3-3c0-5 3-8 6-9Z" />
    <circle cx="12" cy="9.5" r="1.6" />
    <path d="M9 15c-1.5.5-2.5 2-2.5 4 2 0 3.5-1 4-2.5M15 15c1.5.5 2.5 2 2.5 4-2 0-3.5-1-4-2.5" />
  </svg>
);

export const ShareIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="17" cy="6" r="2.5" />
    <circle cx="17" cy="18" r="2.5" />
    <path d="m8.2 10.8 6.6-3.6M8.2 13.2l6.6 3.6" />
  </svg>
);

export const BookIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
  </svg>
);

export const ServerIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="4" width="17" height="7" rx="1.5" />
    <rect x="3.5" y="13" width="17" height="7" rx="1.5" />
    <path d="M7 7.5h.01M7 16.5h.01" />
  </svg>
);

export const WalletIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <path d="M16 14h2" />
  </svg>
);

export const IdCardIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="11" r="2" />
    <path d="M5.5 16.5a3 3 0 0 1 6 0" />
    <path d="M14.5 10h4M14.5 13.5h4" />
  </svg>
);

export const PencilIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    <path d="m14.5 5.5 3 3" />
  </svg>
);

export const FileIcon: Icon = (p) => (
  <svg {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5" />
  </svg>
);

/** Claves de icono usadas en datos (mantiene la config serializable). */
export type IconName =
  | "heart"
  | "spark"
  | "praying"
  | "check"
  | "calendar"
  | "music"
  | "map"
  | "church"
  | "megaphone"
  | "device"
  | "users"
  | "flame"
  | "video"
  | "camera"
  | "code"
  | "palette"
  | "globe"
  | "signal"
  | "rocket"
  | "share"
  | "book"
  | "server"
  | "play"
  | "mail"
  | "search"
  | "chart";

/** Resuelve una clave de icono a su componente. */
export const ICONS: Record<IconName, Icon> = {
  heart: HeartIcon,
  spark: SparkIcon,
  praying: PrayingHands,
  check: CheckIcon,
  calendar: CalendarIcon,
  music: MusicIcon,
  map: MapPinIcon,
  church: ChurchIcon,
  megaphone: MegaphoneIcon,
  device: DeviceIcon,
  users: UsersIcon,
  flame: FlameIcon,
  video: VideoIcon,
  camera: CameraIcon,
  code: CodeIcon,
  palette: PaletteIcon,
  globe: GlobeIcon,
  signal: SignalIcon,
  rocket: RocketIcon,
  share: ShareIcon,
  book: BookIcon,
  server: ServerIcon,
  play: PlayIcon,
  mail: MailIcon,
  search: SearchIcon,
  chart: ChartIcon,
};
