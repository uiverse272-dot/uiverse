type P = { className?: string; size?: number };
const base = (size = 16) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const Search = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
);
export const Bookmark = ({ size, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M6 4h12v16l-6-4.2L6 20z" />
  </svg>
);
export const Plus = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const Dots = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" /></svg>
);
export const External = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M13 5h6v6" /><path d="M19 5 10 14" /><path d="M19 13v6H5V5h6" /></svg>
);
export const Close = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const Chevron = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const ArrowLeft = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const ArrowRight = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const Code = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="m9 8-4 4 4 4M15 8l4 4-4 4" /></svg>
);
export const Sparkle = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" /><path d="M18 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></svg>
);
export const Grid = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="4" y="4" width="7" height="7" rx="1.4" /><rect x="13" y="4" width="7" height="7" rx="1.4" /><rect x="4" y="13" width="7" height="7" rx="1.4" /><rect x="13" y="13" width="7" height="7" rx="1.4" /></svg>
);
export const Home = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></svg>
);
export const Compass = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="8.2" /><path d="m15 9-1.8 4.2L9 15l1.8-4.2z" /></svg>
);
export const User = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="9" r="3.4" /><path d="M5.5 19.2a6.8 6.8 0 0 1 13 0" /></svg>
);
export const Sun = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></svg>
);
export const Moon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
);
export const Filter = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
);
export const Layers = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="m12 4 8 4-8 4-8-4z" /><path d="m4 13 8 4 8-4" /></svg>
);
export const Copy = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5h10" /></svg>
);
export const Check = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="m5 12.5 4.5 4.5L19 7" /></svg>
);
export const Monitor = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3.5" y="4.5" width="17" height="11.5" rx="1" /><path d="M9 20h6M12 16v4" /></svg>
);
export const Phone = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="7" y="3.5" width="10" height="17" rx="1.6" /><path d="M11 17.5h2" /></svg>
);
export const Layout = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 9h16M10 9v11" /></svg>
);
export const Palette = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 4a8 8 0 1 0 0 16c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-.9.7-1.5 1.7-1.5H17a3.3 3.3 0 0 0 3.3-3.4C20.3 6.9 16.6 4 12 4z" /><circle cx="8" cy="11" r="1" fill="currentColor" /><circle cx="11" cy="7.8" r="1" fill="currentColor" /><circle cx="15.2" cy="8.4" r="1" fill="currentColor" /></svg>
);
export const Upload = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4.5 14v5.5h15V14" /></svg>
);
