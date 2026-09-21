export type Palette = {
  key: string;
  name: string;
  bg: string;
  surface: string;
  raised: string;
  text: string;
  muted: string;
  accent: string;
  accentFg: string;
  border: string;
  chart: string[];
  dark: boolean;
};

export const PALETTES: Palette[] = [
  {
    key: "carbon",
    name: "Carbon",
    bg: "#0B0D10", surface: "#131720", raised: "#1B212C",
    text: "#F2F5F8", muted: "#8A94A6", accent: "#5B8CFF", accentFg: "#04070D",
    border: "#222835", chart: ["#5B8CFF", "#3EC9A7", "#F5B544", "#FF6B6B"], dark: true,
  },
  {
    key: "ledger",
    name: "Ledger",
    bg: "#07100C", surface: "#0E1A14", raised: "#15251C",
    text: "#EAF6EF", muted: "#7E9A8B", accent: "#37E29A", accentFg: "#04150D",
    border: "#1B2C22", chart: ["#37E29A", "#7FD4FF", "#FFD166", "#FF8A7A"], dark: true,
  },
  {
    key: "violet",
    name: "Violet AI",
    bg: "#0A0713", surface: "#140E22", raised: "#1E1533",
    text: "#F4F0FF", muted: "#9A8FBF", accent: "#A06BFF", accentFg: "#0A0713",
    border: "#241A3B", chart: ["#A06BFF", "#6BE3FF", "#FF7AD9", "#FFD36B"], dark: true,
  },
  {
    key: "paper",
    name: "Paper",
    bg: "#FFFFFF", surface: "#FAFAF9", raised: "#F4F4F2",
    text: "#14110E", muted: "#7A736B", accent: "#14110E", accentFg: "#FFFFFF",
    border: "#E7E5E1", chart: ["#14110E", "#A8A29A", "#D6D2CB", "#8C7D6B"], dark: false,
  },
  {
    key: "porcelain",
    name: "Porcelain",
    bg: "#F7F8FA", surface: "#FFFFFF", raised: "#EEF1F6",
    text: "#0E1420", muted: "#69748A", accent: "#2C5CFF", accentFg: "#FFFFFF",
    border: "#E2E6EE", chart: ["#2C5CFF", "#19C39A", "#FFAE2E", "#FF5F5F"], dark: false,
  },
  {
    key: "sand",
    name: "Sand",
    bg: "#FBF7F0", surface: "#FFFDF9", raised: "#F2EADF",
    text: "#231C12", muted: "#87786A", accent: "#B4571F", accentFg: "#FFF8F0",
    border: "#EADFCF", chart: ["#B4571F", "#D8A14A", "#6E7F5B", "#9C4B3C"], dark: false,
  },
  {
    key: "ink",
    name: "Ink",
    bg: "#111111", surface: "#191919", raised: "#232323",
    text: "#FAFAFA", muted: "#8F8F8F", accent: "#FAFAFA", accentFg: "#111111",
    border: "#2A2A2A", chart: ["#FAFAFA", "#8F8F8F", "#5A5A5A", "#3A3A3A"], dark: true,
  },
  {
    key: "citrus",
    name: "Citrus",
    bg: "#FFFDF5", surface: "#FFFFFF", raised: "#FFF6DC",
    text: "#1A1703", muted: "#7E7856", accent: "#FF7A1A", accentFg: "#FFFFFF",
    border: "#F0E8CC", chart: ["#FF7A1A", "#FFC94D", "#3BB273", "#3B6FB2"], dark: false,
  },
  {
    key: "ocean",
    name: "Ocean",
    bg: "#05161F", surface: "#0B2231", raised: "#123043",
    text: "#EAF7FF", muted: "#7FA3B8", accent: "#31C5F5", accentFg: "#05161F",
    border: "#17394C", chart: ["#31C5F5", "#5BE0C0", "#FFD479", "#FF8BA0"], dark: true,
  },
  {
    key: "rose",
    name: "Rose",
    bg: "#FFF8F9", surface: "#FFFFFF", raised: "#FDEDF0",
    text: "#2B0F16", muted: "#8C6670", accent: "#E5486E", accentFg: "#FFFFFF",
    border: "#F6DDE3", chart: ["#E5486E", "#F59BAF", "#7A5CD1", "#3CB9A0"], dark: false,
  },
  {
    key: "forest",
    name: "Forest",
    bg: "#F6F8F5", surface: "#FFFFFF", raised: "#E9EFE7",
    text: "#101A12", muted: "#63776A", accent: "#2E6B47", accentFg: "#FFFFFF",
    border: "#DEE6DB", chart: ["#2E6B47", "#7FB08D", "#C9A227", "#4F6D9E"], dark: false,
  },
  {
    key: "noir",
    name: "Noir Luxe",
    bg: "#0C0A08", surface: "#151210", raised: "#1E1A16",
    text: "#F3EDE4", muted: "#9B8F80", accent: "#C8A96A", accentFg: "#100D0A",
    border: "#26211B", chart: ["#C8A96A", "#8C7A5B", "#F3EDE4", "#5C5142"], dark: true,
  },
  {
    key: "electric",
    name: "Electric",
    bg: "#08090B", surface: "#101216", raised: "#181C22",
    text: "#F7F8FA", muted: "#858C99", accent: "#C8FF2D", accentFg: "#0B0D07",
    border: "#1E232B", chart: ["#C8FF2D", "#2DE2FF", "#FF4D8D", "#FFB020"], dark: true,
  },
  {
    key: "cloud",
    name: "Cloud",
    bg: "#FAFBFF", surface: "#FFFFFF", raised: "#EFF2FD",
    text: "#0D1024", muted: "#6B7194", accent: "#4B44E8", accentFg: "#FFFFFF",
    border: "#E5E8F7", chart: ["#4B44E8", "#28C2B4", "#FFB43D", "#FF6F91"], dark: false,
  },
  {
    key: "concrete",
    name: "Concrete",
    bg: "#EFEFEC", surface: "#FFFFFF", raised: "#E3E3DE",
    text: "#101010", muted: "#6E6E68", accent: "#0F0F0F", accentFg: "#F3F3EF",
    border: "#D8D8D2", chart: ["#0F0F0F", "#767670", "#B4B4AE", "#E0402F"], dark: false,
  },
  {
    key: "mint",
    name: "Mint",
    bg: "#F4FBF9", surface: "#FFFFFF", raised: "#E4F5F0",
    text: "#06201A", muted: "#5F8078", accent: "#00A884", accentFg: "#FFFFFF",
    border: "#D7EBE5", chart: ["#00A884", "#5AC8FA", "#FFC53D", "#FF7A85"], dark: false,
  },
];

export const paletteByKey = (key: string): Palette =>
  PALETTES.find((p) => p.key === key) ?? PALETTES[0];
