import { AlertTriangle, Mail, MessageSquare, UserPlus, Wrench, Bell } from 'lucide-react'

export type FeedItem = {
  id: string
  type: string
  title: string
  body: string | null
  href: string | null
  readAt: string | null
  createdAt: string
}

const ICONS: Record<string, React.ElementType> = {
  message: MessageSquare,
  subscriber: UserPlus,
  error: AlertTriangle,
  maintenance: Wrench,
  newsletter: Mail,
}

export function NotificationIcon({ type }: { type: string }) {
  const Icon = ICONS[type] ?? Bell
  return (
    <span className="admin-feed-icon" data-type={type} aria-hidden="true">
      <Icon size={15} />
    </span>
  )
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]
const relative = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' })

export function timeAgo(iso: string | Date, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  for (const [unit, size] of UNITS)
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  return 'just now'
}
