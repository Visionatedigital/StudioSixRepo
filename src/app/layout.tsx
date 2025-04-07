import './globals.css'
import { Inter, Poppins, Lato, Cabin, Roboto, Caveat, Short_Stack } from 'next/font/google'
import type { Metadata } from 'next'
import { Providers } from './providers'
import ClientScrollProvider from '@/components/ClientScrollProvider'
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
  title: 'StudioSix - AI Design Assistant',
  description: 'Design smarter, render faster with StudioSix AI Design Assistant',
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
          <ClientScrollProvider>
            <Providers>{children}</Providers>
          </ClientScrollProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
