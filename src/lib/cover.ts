export const COVER_PALETTE = [
  { bg: '#215750', fg: '#FBF3E7' }, // teal
  { bg: '#E56F42', fg: '#FBF3E7' }, // coral
  { bg: '#F5C451', fg: '#22303A' }, // sunny
  { bg: '#7A9C4F', fg: '#FBF3E7' }, // sage
  { bg: '#1B4640', fg: '#FBF3E7' }, // deep teal
];

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function coverPaletteFor(slug: string) {
  return COVER_PALETTE[hashString(slug) % COVER_PALETTE.length];
}
