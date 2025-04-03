import './globals.css'
import { Inter, Poppins, Lato, Cabin, Roboto, Caveat, Short_Stack } from 'next/font/google'
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
const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
});
const shortStack = Short_Stack({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-short-stack',
});

export const metadata: Metadata = {
  title: 'StudioSix - AI Architectural Visualization',
  description: 'Transform your architectural sketches into stunning 3D renders with AI. Professional-grade architectural visualization made easy with StudioSix.ai',
  keywords: 'AI architecture, architectural visualization, 3D rendering, AI rendering, architectural design, building visualization, architectural AI, design automation',
  authors: [{ name: 'StudioSix' }],
  creator: 'StudioSix',
  publisher: 'StudioSix',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://studiosix.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'StudioSix - AI Architectural Visualization',
    description: 'Transform your architectural sketches into stunning 3D renders with AI. Professional-grade architectural visualization made easy.',
    url: 'https://studiosix.ai',
    siteName: 'StudioSix',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StudioSix AI Architectural Visualization',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudioSix - AI Architectural Visualization',
    description: 'Transform your architectural sketches into stunning 3D renders with AI. Professional-grade architectural visualization made easy.',
    images: ['/og-image.jpg'],
    creator: '@studiosix',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification', // You'll need to add this after setting up Google Search Console
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${lato.variable} ${cabin.variable} ${roboto.variable} ${caveat.variable} ${shortStack.variable}`}>
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
