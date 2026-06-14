'use client'

import { useState, useEffect } from 'react'
import { Brain, ExternalLink, Wallet, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileDropdown, setShowMobileDropdown] = useState(false)

  // Real EVM Wallet Connection (MetaMask, Rabby, Brave, Coinbase extension, etc.)
  const connectWallet = async () => {
    if (typeof window === 'undefined') return

    const ethereum = (window as any).ethereum
    if (!ethereum) {
      toast.error('No EVM wallet detected. Please install MetaMask or another browser wallet extension.')
      return
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setWalletConnected(true)
        setShowDropdown(false)
        setShowMobileDropdown(false)
        toast.success(`Connected address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Wallet connection rejected')
    }
  }

  // Handle other provider choices
  const connectWithProvider = async (providerName: string) => {
    if (providerName === 'MetaMask' || providerName === 'EVM Wallet') {
      await connectWallet()
    } else {
      // For WalletConnect/Coinbase, fallback to standard window.ethereum if installed
      const ethereum = (window as any).ethereum
      if (ethereum) {
        toast.loading(`Launching ${providerName} via browser extension...`, { id: 'provider-connect', duration: 1500 })
        await connectWallet()
      } else {
        toast.error(`Please install the ${providerName} browser extension to connect.`)
      }
    }
  }

  const disconnectWallet = () => {
    setWalletConnected(false)
    setWalletAddress('')
    setShowDropdown(false)
    setShowMobileDropdown(false)
    toast.success('Wallet disconnected (client state cleared)')
  }

  // Automatic connection checks & account change listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    const ethereum = (window as any).ethereum
    if (ethereum) {
      // Check if already authorized
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
            setWalletConnected(true)
          }
        })
        .catch(console.error)

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
          toast.success(`Wallet switched: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
        } else {
          setWalletConnected(false)
          setWalletAddress('')
          toast.success('Wallet disconnected')
        }
      }

      // Listen for chain changes (best practice to reload page to avoid state mismatch)
      const handleChainChanged = () => {
        window.location.reload()
      }

      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [])

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault()
      document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })
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
          <a 
            href="/?scroll=dashboard" 
            onClick={handleDashboardClick} 
            className="text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </a>
          <a 
            href="/how-it-works" 
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
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
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="btn-purple px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 tracking-wider uppercase"
            >
              <Wallet className="w-4 h-4" />
              {walletConnected ? (
                <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              ) : (
                "Connect Wallet"
              )}
            </button>

            {/* Wallet Selection Dropdown */}
            {showDropdown && !walletConnected && (
              <div className="absolute right-0 mt-2 w-56 premium-card p-4 space-y-2 z-50 text-left border border-purple-500/20 bg-[#12121a]">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Connect EVM Wallet</div>
                <button 
                  onClick={() => connectWithProvider('MetaMask')}
                  className="w-full text-left p-2.5 rounded hover:bg-purple-500/10 hover:text-white text-xs font-mono text-gray-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  MetaMask
                </button>
                <button 
                  onClick={() => connectWithProvider('WalletConnect')}
                  className="w-full text-left p-2.5 rounded hover:bg-purple-500/10 hover:text-white text-xs font-mono text-gray-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  WalletConnect
                </button>
                <button 
                  onClick={() => connectWithProvider('Coinbase Wallet')}
                  className="w-full text-left p-2.5 rounded hover:bg-purple-500/10 hover:text-white text-xs font-mono text-gray-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Coinbase Wallet
                </button>
              </div>
            )}

            {/* Disconnect Dropdown */}
            {showDropdown && walletConnected && (
              <div className="absolute right-0 mt-2 w-48 premium-card p-3 z-50 text-left border border-purple-500/20 bg-[#12121a]">
                <button 
                  onClick={disconnectWallet}
                  className="w-full text-left p-2 rounded hover:bg-red-500/10 hover:text-red-400 text-xs font-mono text-gray-300 transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
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
            href="/?scroll=dashboard"
            onClick={(e) => {
              handleDashboardClick(e);
              setIsMenuOpen(false);
            }}
            className="block text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white py-2"
          >
            Dashboard
          </a>
          <a
            href="/how-it-works"
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
          
          <div className="space-y-2">
            <button
              onClick={() => setShowMobileDropdown(!showMobileDropdown)}
              className="btn-purple w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 tracking-wider uppercase"
            >
              <Wallet className="w-4 h-4" />
              {walletConnected ? (
                <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              ) : (
                "Connect Wallet"
              )}
            </button>

            {/* Mobile Wallet Options */}
            {showMobileDropdown && !walletConnected && (
              <div className="p-2 space-y-1 bg-black/40 rounded-lg border border-purple-500/10">
                <button 
                  onClick={() => {
                    connectWithProvider('MetaMask');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center py-2 rounded text-xs font-mono text-gray-300 hover:text-white hover:bg-purple-500/10"
                >
                  MetaMask
                </button>
                <button 
                  onClick={() => {
                    connectWithProvider('WalletConnect');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center py-2 rounded text-xs font-mono text-gray-300 hover:text-white hover:bg-purple-500/10"
                >
                  WalletConnect
                </button>
                <button 
                  onClick={() => {
                    connectWithProvider('Coinbase Wallet');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center py-2 rounded text-xs font-mono text-gray-300 hover:text-white hover:bg-purple-500/10"
                >
                  Coinbase Wallet
                </button>
              </div>
            )}

            {/* Mobile Disconnect */}
            {showMobileDropdown && walletConnected && (
              <button 
                onClick={() => {
                  disconnectWallet();
                  setIsMenuOpen(false);
                }}
                className="w-full text-center py-2 rounded text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20"
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}