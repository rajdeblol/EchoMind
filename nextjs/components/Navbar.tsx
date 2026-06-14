'use client'

import { useState } from 'react'
import { Brain, ExternalLink, Wallet, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false)
      toast.success('Wallet disconnected')
    } else {
      setWalletConnected(true)
      toast.success('Wallet connected: 0x7c3a...ed55')
    }
  }

  return (
    <nav className="sticky top-0 z-50 premium-card px-5 py-4 mt-6 mb-8">
      <div className="flex items-center justify-between">
        {/* Left Side: Logo and Network Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white uppercase leading-none">
              EchoMind
            </h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-tight mt-0.5">Persistent Agent Memory</p>
          </div>
          <span className="hidden sm:inline-block badge-pill px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Pharos Testnet • 688689
          </span>
        </div>

        {/* Center: Simplified Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors">
            Dashboard
          </a>
          <a href="#how-it-works" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">
            How it works
          </a>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://atlantic.pharosscan.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 tracking-wider uppercase"
          >
            PharosScan <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={toggleWallet}
            className="btn-purple px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 tracking-wider uppercase"
          >
            <Wallet className="w-4 h-4" />
            {walletConnected ? (
              <span className="font-mono">0x7c3a..ed55</span>
            ) : (
              "Connect Wallet"
            )}
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
        <div className="md:hidden mt-4 pt-4 border-t border-gray-900 space-y-4">
          <a
            href="#"
            className="block text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </a>
          <a
            href="#how-it-works"
            className="block text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            How it works
          </a>
          <a
            href="https://atlantic.pharosscan.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 tracking-wider uppercase"
            onClick={() => setIsMenuOpen(false)}
          >
            PharosScan <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              toggleWallet();
              setIsMenuOpen(false);
            }}
            className="btn-purple w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 tracking-wider uppercase"
          >
            <Wallet className="w-4 h-4" />
            {walletConnected ? (
              <span className="font-mono">0x7c3a..ed55</span>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>
      )}
    </nav>
  )
}