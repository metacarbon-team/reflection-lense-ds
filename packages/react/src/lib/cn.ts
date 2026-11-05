import { twMergeConfig } from '@reflection/theme/tw-merge'
import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/** tailwind-merge that knows the theme's text role utilities (`text-body`, `text-heading-large`…). */
const twMerge = extendTailwindMerge<'text-role'>(twMergeConfig)

/**
 * Joins class names conditionally and resolves Tailwind conflicts, so a consumer's
 * `className` overrides a component class of the same property (ADR 0032).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export type { ClassValue }
