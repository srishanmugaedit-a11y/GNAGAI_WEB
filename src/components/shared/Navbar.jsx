'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Database, Plus, Home } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import SupabaseConfigModal from './SupabaseConfigModal';
export default function Navbar() {
  const pathname = usePathname();
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  useEffect(() => {
    setSupabaseConnected(isSupabaseConfigured());
  }, []);
  return (<>
    <header className="sticky top-0 z-40 w-full border-b border-gold-500/20 bg-stone-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo & Portal Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            {/* Sacred Deity Circular Emblem */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-[1.5px] shadow-lg shadow-gold-500/15 group-hover:shadow-gold-500/30 transition-all duration-300 shrink-0">
              <div className="w-full h-full bg-stone-950 rounded-full overflow-hidden relative border border-gold-300/80">
                <img
                  src="/gangai-logo.jpeg"
                  alt="Sri Gangai Amman"
                  className="w-full h-full object-cover object-top select-none group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="truncate">
              <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-stone-100 flex items-center gap-1">
                GANGAI <span className="text-gold-400 font-serif italic text-lg sm:text-2xl font-bold">Studio</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-gold-400/80 -mt-0.5 block truncate">
                Host Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${pathname === '/'
            ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'}`}>
            <span className="flex items-center gap-1.5">
              <Home className="w-4 h-4" />
              Dashboard
            </span>
          </Link>
          <Link href="/events/new" className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${pathname === '/events/new'
            ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'}`}>
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Create Event
            </span>
          </Link>
        </nav>

        {/* Right Action & Supabase Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Database Engine Status Button */}
          <button onClick={() => setIsConfigOpen(true)} className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-all ${supabaseConnected
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
            : 'bg-gold-950/40 border-gold-500/30 text-gold-300 hover:bg-gold-900/40'}`} title="Click to configure Supabase Storage & Database connection">
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {supabaseConnected ? 'Supabase Live' : 'Demo Local Mode'}
            </span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse bg-current" />
          </button>

          {/* Create Event CTA */}
          <Link href="/events/new" className="flex items-center gap-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 font-semibold text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all hover:scale-[1.02]">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">New Event</span>
            <span className="xs:hidden sm:hidden">+</span>
          </Link>
        </div>
      </div>
    </header>

    {/* Supabase Config Modal Drawer */}
    <SupabaseConfigModal isOpen={isConfigOpen} onClose={() => {
      setIsConfigOpen(false);
      setSupabaseConnected(isSupabaseConfigured());
    }} />
  </>);
}
