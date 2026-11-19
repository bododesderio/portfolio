import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaMedium,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import type { ProfileLink } from '@/lib/domain/profile'

const ICONS: Record<ProfileLink['label'], React.ElementType> = {
  Facebook: FaFacebookF,
  Instagram: FaInstagram,
  X: FaXTwitter,
  YouTube: FaYoutube,
  LinkedIn: FaLinkedinIn,
  GitHub: FaGithub,
  Medium: FaMedium,
}

export function ProfileIcon({ label, size = 16 }: { label: ProfileLink['label']; size?: number }) {
  const Icon = ICONS[label]
  return <Icon size={size} aria-hidden="true" focusable="false" />
}
