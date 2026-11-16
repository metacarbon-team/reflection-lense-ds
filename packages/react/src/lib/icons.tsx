// Glyphs the components draw themselves (chevrons, check, close). 16px grid, currentColor stroke.
// Product icons come from the consumer, through slots.

import type { ComponentProps } from 'react'

type IconProps = ComponentProps<'svg'>

const Icon = ({ children, ...props }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
)

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 6l4 4 4-4" />
  </Icon>
)

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 4l4 4-4 4" />
  </Icon>
)

export const DotsIcon = (props: IconProps) => (
  <Icon fill="currentColor" stroke="none" {...props}>
    <circle cx="3" cy="8" r="1.25" />
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="13" cy="8" r="1.25" />
  </Icon>
)

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 8.5l3 3 6-7" />
  </Icon>
)

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Icon>
)

export const UserIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="8" cy="5.5" r="2.5" />
    <path d="M3 13.5c.6-2.4 2.6-3.5 5-3.5s4.4 1.1 5 3.5" />
  </Icon>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10 4L6 8l4 4" />
  </Icon>
)

export const CalendarIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
    <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
  </Icon>
)

export const FileIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 2H4.5A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V6L9 2z" />
    <path d="M9 2v4h4" />
  </Icon>
)

export const CopyIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 5.5v-2A1.5 1.5 0 009 2H3.5A1.5 1.5 0 002 3.5V9a1.5 1.5 0 001.5 1.5h2" />
  </Icon>
)
