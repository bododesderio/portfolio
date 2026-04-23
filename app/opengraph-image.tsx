import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Bodo Desderio — Founder, Engineer & Community Leader'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px',
          background:
            'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(201,168,76,0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(68,92,201,0.18), transparent 60%), #0a0a0b',
          color: 'white',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '20px',
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: '#C9A84C' }} />
          BODO DESDERIO
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '110px',
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
            }}
          >
            <span>Founder.</span>
            <span>Leader.</span>
            <span style={{ color: '#DDBF58', fontStyle: 'italic' }}>Builder.</span>
          </div>
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '760px',
              fontFamily: 'sans-serif',
              lineHeight: 1.4,
            }}
          >
            Building companies, communities, and technology that move people forward.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          <span>Kampala, Uganda</span>
          <span>bododesderio.com</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
