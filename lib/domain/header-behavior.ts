export const HEADER_BEHAVIORS = {
  hide: {
    label: 'Hide while scrolling down',
    detail: 'Fades away like smoke as visitors read, and returns as soon as they scroll up.',
  },
  sticky: { label: 'Always visible', detail: 'Stays pinned to the top of the screen.' },
  static: { label: 'Scrolls with the page', detail: 'Sits at the top of the page and scrolls away.' },
} as const
export type HeaderBehavior = keyof typeof HEADER_BEHAVIORS
export const HEADER_BEHAVIOR_KEY = 'nav.header_behavior'

export function readHeaderBehavior(value: string | null | undefined): HeaderBehavior {
  return value && value in HEADER_BEHAVIORS ? (value as HeaderBehavior) : 'hide'
}
