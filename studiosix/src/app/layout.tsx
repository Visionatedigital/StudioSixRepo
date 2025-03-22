import './globals.css'
import { Inter, Poppins, Lato, Cabin, Roboto } from 'next/font/google'
import type { Metadata } from 'next'
import { Providers } from './providers'
import LocomotiveScrollProvider from '@/components/LocomotiveScrollProvider'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})
const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato'
})
const cabin = Cabin({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-cabin'
})
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: 'StudioSix - AI Architectural Visualization',
  description: 'Transform your sketches into stunning architectural renders with AI',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${lato.variable} ${cabin.variable} ${roboto.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-[#F6F8FA] min-h-screen overflow-x-auto">
        <AuthProvider>
          <LocomotiveScrollProvider>
            <Providers>{children}</Providers>
          </LocomotiveScrollProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
