import type { Metadata } from "next"
import "@fontsource-variable/inter"
import "@fontsource/playfair-display"
import "@fontsource/playfair-display/700.css"
import "./globals.css"
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import { ThemeInjector } from '@/components/layout/ThemeInjector'
import { ContentProtection } from '@/components/ui/ContentProtection'
import { personSchema, websiteSchema } from '@/lib/schema'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bodo Desderio — Founder, Leader, Builder',
    template: '%s — Bodo Desderio',
  },
  description: 'Bodo Desderio — Ugandan entrepreneur, software engineer, and community leader. Founder & CEO of Rooibok Technologies.',
  applicationName: 'Bodo Desderio',
  authors: [{ name: 'Bodo Desderio', url: SITE_URL }],
  creator: 'Bodo Desderio',
  publisher: 'Bodo Desderio',
  openGraph: {
    type: 'website',
    locale: 'en_UG',
    url: SITE_URL,
    siteName: 'Bodo Desderio',
    title: 'Bodo Desderio — Founder, Leader, Builder',
    description: 'Building companies, communities, and technology that move people forward.',
  },
  twitter: { card: 'summary_large_image', creator: '@bodo_desderio' },
  robots: { index: true, follow: true },
  other: {
    'application/ld+json': JSON.stringify([personSchema(), websiteSchema()]),
  },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInjector />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" />
          <ContentProtection />
        </ThemeProvider>
      </body>
    </html>
  )
}
