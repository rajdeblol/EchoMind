'use client'

import { Brain, Menu, X, Zap, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 glass rounded-2xl mt-6 mb-8">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                EchoMind
              </h1>
              <p className="text-xs text-gray-400">Persistent Agent Memory</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-accent transition-colors">
              Dashboard
            </Link>
            <Link href="#remember" className="text-gray-300 hover:text-accent transition-colors">
              Remember
            </Link>
            <Link href="#recall" className="text-gray-300 hover:text-accent transition-colors">
              Recall
            </Link>
            <Link href="#verify" className="text-gray-300 hover:text-accent transition-colors">
              Verify
            </Link>
            <a
              href="https://atlantic.pharosscan.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 btn-secondary"
            >
              <span>PharosScan</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <button className="flex items-center space-x-2 btn-primary">
              <Zap className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden space-y-4 pb-4">
            <Link
              href="/"
              className="block text-gray-300 hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="#remember"
              className="block text-gray-300 hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Remember
            </Link>
            <Link
              href="#recall"
              className="block text-gray-300 hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Recall
            </Link>
            <Link
              href="#verify"
              className="block text-gray-300 hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Verify
            </Link>
            <a
              href="https://atlantic.pharosscan.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="block btn-secondary w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              PharosScan
            </a>
            <button className="btn-primary w-full text-center">
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}