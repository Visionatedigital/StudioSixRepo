import './globals.css'
import { Inter, Poppins, Lato, Cabin, Roboto, Caveat } from 'next/font/google'
import type { Metadata } from 'next'
import { Providers } from './providers'
import ClientScrollProvider from '@/components/ClientScrollProvider'
import AuthProvider from '@/components/AuthProvider'
import { NotificationProvider } from '@/contexts/NotificationContext'
import ToastContainer from '@/components/notifications/ToastContainer'

// Load Google Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
})

const cabin = Cabin({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-cabin',
})

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
})

// Note: ShortStack is not available in Google Fonts, so we'll need to handle it differently
// For now, we'll remove it from the layout

export const metadata: Metadata = {
  title: 'StudioSix - AI Design Assistant',
  description: 'Design smarter, render faster with StudioSix AI Design Assistant',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${lato.variable} ${cabin.variable} ${roboto.variable} ${caveat.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-[#F6F8FA] min-h-screen overflow-x-auto">
        <AuthProvider>
          <ClientScrollProvider>
            <NotificationProvider>
              <Providers>{children}</Providers>
              <ToastContainer />
            </NotificationProvider>
          </ClientScrollProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
