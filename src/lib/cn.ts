import { clsx, type ClassValue } from 'clsx'

/**
 * Joins class names conditionally. Styling-agnostic on purpose: no
 * conflict resolution (e.g. tailwind-merge) until the styling approach is chosen.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export type { ClassValue }
