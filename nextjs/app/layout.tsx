import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EchoMind - Persistent Agent Memory',
  description: 'AI agent memory storage anchored on Pharos blockchain',
  keywords: ['Pharos', 'Blockchain', 'AI', 'Memory', 'Agent'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
        <div className="container mx-auto px-4 max-w-7xl">
          <Navbar />
          <main className="py-8">{children}</main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f8fafc',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  )
}