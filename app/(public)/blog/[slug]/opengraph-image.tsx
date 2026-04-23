import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const alt = 'Blog post by Bodo Desderio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } })
  const title = post?.title ?? 'Bodo Desderio'
  const category = post?.category ?? 'Writing'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          background:
            'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(201,168,76,0.35), transparent 60%), #0a0a0b',
          color: 'white',
          fontFamily: 'serif',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 20,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: '#C9A84C' }} />
          BODO DESDERIO &nbsp;·&nbsp; {category}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: title.length > 80 ? 56 : title.length > 50 ? 70 : 88,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: '1040px',
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 18,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          <span>bododesderio.com / blog</span>
          <span>Read the post →</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
