import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_Thai } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const notoThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-thai',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Smart Parking — ดูช่องจอดว่างแบบเรียลไทม์',
  description: 'ระบบจอดรถอัจฉริยะ ดูสถานะช่องจอดแบบเรียลไทม์จากเซนเซอร์ และจองช่องจอดล่วงหน้าได้ทันที',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#14171f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${geist.variable} ${geistMono.variable} ${notoThai.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster theme="dark" position="top-center" richColors
          toastOptions={{ style: { fontFamily: 'var(--font-thai), var(--font-geist), sans-serif' } }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
