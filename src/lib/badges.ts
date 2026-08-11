import { hashString } from './cover';

/**
 * Deterministic pastel color assignment for topic/tag pills, so the same
 * tag always renders in the same color without a hand-maintained map.
 */
const PALETTE = [
  'bg-teal-100 text-teal-800',
  'bg-coral-100 text-coral-600',
  'bg-sunny-100 text-sunny-500',
  'bg-sage-100 text-sage-600',
];

export function badgeClassesFor(label: string): string {
  return PALETTE[hashString(label) % PALETTE.length];
}
