import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import { ThemeInjector } from '@/components/layout/ThemeInjector'
import { ldJson, personSchema, websiteSchema } from '@/lib/schema'

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] })

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
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInjector />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson([personSchema(), websiteSchema()]) }}
        />
      </body>
    </html>
  )
}
