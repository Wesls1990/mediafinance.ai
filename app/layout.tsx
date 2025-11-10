import type { ReactNode } from 'react'
import './globals.css'
import Navbar from '../components/Navbar'
import ScrollEffects from '../components/ScrollEffects'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Media Finance AI — Flash',
  description: 'The future of film budgeting. AI-driven. Studio-compliant.',
  icons: { icon: '/logo.png' },
  openGraph: { title: 'Media Finance AI — Flash', images: ['/logo.png'] }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-wrap" /><div className="bg-vignette" />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
        <Footer />
        <ScrollEffects />
      </body>
    </html>
  )
}
