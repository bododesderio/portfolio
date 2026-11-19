import type { Metadata } from 'next'
import { headers } from 'next/headers'
import '@fontsource-variable/inter'
import './globals.css'
import './appearance.css'
import { PreferencesProvider } from '@/components/appearance/PreferencesProvider'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import { ThemeInjector } from '@/components/layout/ThemeInjector'
import { preferenceBootScript } from '@/lib/domain/appearance'
import { ErrorReporter } from '@/components/ErrorReporter'
import { ldJson, personSchema, websiteSchema } from '@/lib/schema'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bodo Desderio · Software engineer in Lira City, Uganda',
    template: '%s | Bodo Desderio',
  },
  description:
    'Bodo Desderio is a Ugandan entrepreneur, software engineer, and community leader. Founder & CEO of Rooibok Technologies.',
  applicationName: 'Bodo Desderio',
  icons: {
    icon: [
      { url: '/identity/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  authors: [{ name: 'Bodo Desderio', url: SITE_URL }],
  creator: 'Bodo Desderio',
  publisher: 'Bodo Desderio',
  openGraph: {
    type: 'website',
    locale: 'en_UG',
    url: SITE_URL,
    siteName: 'Bodo Desderio',
    title: 'Bodo Desderio · Software engineer in Lira City, Uganda',
    description:
      'Software engineer and SEO specialist in Lira City, Uganda. Founder of Rooibok Technologies and Parler Foundation.',
  },
  twitter: { card: 'summary_large_image', creator: '@bodo_desderio' },
  robots: { index: true, follow: true },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Per-request nonce from the middleware CSP; next-themes' pre-paint script
  // carries it so it isn't blocked under the nonce-based production policy.
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInjector />
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: preferenceBootScript }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: ldJson([personSchema(), websiteSchema()]),
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          nonce={nonce}
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PreferencesProvider>{children}</PreferencesProvider>
          <Toaster position="bottom-right" />
          <ErrorReporter />
        </ThemeProvider>
      </body>
    </html>
  )
}
