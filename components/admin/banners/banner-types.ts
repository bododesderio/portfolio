import {
  Megaphone, Cookie, MessageSquare, CornerDownRight, Layers,
} from 'lucide-react'

export interface Banner {
  id: string
  name: string
  kind: string
  placement: string
  title: string | null
  body: string | null
  imageUrl: string | null
  ctaLabel: string | null
  ctaUrl: string | null
  ctaVariant: string
  dismissable: boolean
  requireConsent: boolean
  theme: string
  enabled: boolean
  priority: number
  startsAt: string | null
  endsAt: string | null
  pagesInclude: string[]
  pagesExclude: string[]
  devices: string[]
  showOnce: boolean
  cooldownHours: number
  delaySeconds: number
  scrollTrigger: number | null
  exitIntent: boolean
  newsletterHook: boolean
}

export const EMPTY_FORM = {
  name: '',
  kind: 'topbar' as string,
  placement: 'bottom' as string,
  title: '',
  body: '',
  imageUrl: '',
  ctaLabel: '',
  ctaUrl: '',
  ctaVariant: 'primary' as string,
  dismissable: true,
  requireConsent: false,
  theme: 'auto' as string,
  enabled: false,
  priority: 0,
  startsAt: '',
  endsAt: '',
  pagesInclude: '' as string,
  pagesExclude: '' as string,
  devices: [] as string[],
  showOnce: false,
  cooldownHours: 0,
  delaySeconds: 0,
  scrollTrigger: '' as string | number,
  exitIntent: false,
  newsletterHook: false,
  animation: 'fade' as string,
}

export type FormState = typeof EMPTY_FORM

export const KIND_OPTIONS = [
  { value: 'topbar', label: 'Top Bar', icon: Megaphone },
  { value: 'bottombar', label: 'Bottom Bar', icon: Layers },
  { value: 'modal', label: 'Modal', icon: MessageSquare },
  { value: 'corner', label: 'Corner Popup', icon: CornerDownRight },
  { value: 'cookie', label: 'Cookie Consent', icon: Cookie },
]

export const KIND_COLORS: Record<string, string> = {
  topbar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  bottombar: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  modal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  corner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cookie: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

export const PLACEMENT_OPTIONS = ['top', 'bottom', 'left', 'right', 'center']
export const THEME_OPTIONS = ['auto', 'light', 'dark', 'brand']
export const CTA_VARIANTS = ['primary', 'outline', 'invert']
export const DEVICE_OPTIONS = ['mobile', 'tablet', 'desktop']
export const ANIMATION_OPTIONS = [
  { value: 'fade', label: 'Fade In' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'pop', label: 'Pop / Scale' },
  { value: 'drop', label: 'Drop In' },
  { value: 'none', label: 'None' },
]

export const ANIMATION_STYLES: Record<string, { from: React.CSSProperties; to: React.CSSProperties }> = {
  fade:          { from: { opacity: 0 },                                                       to: { opacity: 1 } },
  'slide-up':    { from: { opacity: 0, transform: 'translateY(24px)' },                        to: { opacity: 1, transform: 'translateY(0)' } },
  'slide-down':  { from: { opacity: 0, transform: 'translateY(-24px)' },                       to: { opacity: 1, transform: 'translateY(0)' } },
  'slide-left':  { from: { opacity: 0, transform: 'translateX(24px)' },                        to: { opacity: 1, transform: 'translateX(0)' } },
  'slide-right': { from: { opacity: 0, transform: 'translateX(-24px)' },                       to: { opacity: 1, transform: 'translateX(0)' } },
  pop:           { from: { opacity: 0, transform: 'scale(0.85)' },                             to: { opacity: 1, transform: 'scale(1)' } },
  drop:          { from: { opacity: 0, transform: 'translateY(-40px) scale(0.95)' },            to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
  none:          { from: { opacity: 1 },                                                       to: { opacity: 1 } },
}

export function bannerToForm(b: Banner): FormState {
  return {
    name: b.name,
    kind: b.kind,
    placement: b.placement,
    title: b.title ?? '',
    body: b.body ?? '',
    imageUrl: b.imageUrl ?? '',
    ctaLabel: b.ctaLabel ?? '',
    ctaUrl: b.ctaUrl ?? '',
    ctaVariant: b.ctaVariant,
    dismissable: b.dismissable,
    requireConsent: b.requireConsent,
    theme: b.theme,
    enabled: b.enabled,
    priority: b.priority,
    startsAt: b.startsAt ? b.startsAt.slice(0, 16) : '',
    endsAt: b.endsAt ? b.endsAt.slice(0, 16) : '',
    pagesInclude: b.pagesInclude.join(', '),
    pagesExclude: b.pagesExclude.join(', '),
    devices: b.devices,
    showOnce: b.showOnce,
    cooldownHours: b.cooldownHours,
    delaySeconds: b.delaySeconds,
    scrollTrigger: b.scrollTrigger ?? '',
    exitIntent: b.exitIntent,
    newsletterHook: b.newsletterHook,
    animation: 'fade',
  }
}

export function formToPayload(f: FormState) {
  return {
    name: f.name,
    kind: f.kind,
    placement: f.placement,
    title: f.title || null,
    body: f.body || null,
    imageUrl: f.imageUrl || null,
    ctaLabel: f.ctaLabel || null,
    ctaUrl: f.ctaUrl || null,
    ctaVariant: f.ctaVariant,
    dismissable: f.dismissable,
    requireConsent: f.requireConsent,
    theme: f.theme,
    enabled: f.enabled,
    priority: f.priority,
    startsAt: f.startsAt || null,
    endsAt: f.endsAt || null,
    pagesInclude: typeof f.pagesInclude === 'string'
      ? f.pagesInclude.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    pagesExclude: typeof f.pagesExclude === 'string'
      ? f.pagesExclude.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    devices: f.devices,
    showOnce: f.showOnce,
    cooldownHours: f.cooldownHours,
    delaySeconds: f.delaySeconds,
    scrollTrigger: f.scrollTrigger === '' ? null : Number(f.scrollTrigger),
    exitIntent: f.exitIntent,
    newsletterHook: f.newsletterHook,
  }
}
