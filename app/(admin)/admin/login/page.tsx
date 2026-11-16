import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from '@/components/admin/LoginForm'
import { BrandMark } from '@/components/personal/BrandMark'
import { getSiteSetting } from '@/lib/data/content'
import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sign in · Studio' }
export default async function LoginPage() {
  const [image, background, heading, subtitle, title, description] =
    await Promise.all(
      [
        'login_card_image',
        'login_background_url',
        'login_heading',
        'login_subtitle',
        'login_overlay_title',
        'login_overlay_subtitle',
      ].map(getSiteSetting)
    )
  return (
    <div className="admin-site admin-login">
      <div className="admin-login-card">
        <aside className="admin-login-aside">
          {(image || background) && (
            <span className="admin-login-image">
              <Image
                src={(image || background)!}
                alt=""
                fill
                priority
                sizes="400px"
                className="object-cover"
              />
            </span>
          )}
          <BrandMark />
          <div>
            <h2>{title || 'A place for your story.'}</h2>
            <p>
              {description ||
                'Your life, work, ideas, and everything along the way.'}
            </p>
          </div>
        </aside>
        <div className="admin-login-form">
          <LoginForm
            heading={heading || 'Welcome to your studio'}
            subtitle={subtitle || 'Sign in to tend to your personal archive.'}
          />
          <Link href="/" className="admin-login-foot">
            ← Back to the portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}
