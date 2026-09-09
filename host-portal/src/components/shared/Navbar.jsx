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
    <header className="sticky top-0 z-40 w-full border-b border-gold-500/20 bg-stone-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Portal Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-[1px] shadow-lg shadow-gold-500/10">
              <div className="w-full h-full bg-stone-950 rounded-[11px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-stone-100 flex items-center gap-1.5">
                GANGAI <span className="text-gold-400 font-serif italic text-2xl font-bold">Studio</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-gold-400/80 -mt-0.5 block">
                Host & Admin Portal
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
        <div className="flex items-center gap-2.5">
          {/* Database Engine Status Button */}
          <button onClick={() => setIsConfigOpen(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${supabaseConnected
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
            : 'bg-gold-950/40 border-gold-500/30 text-gold-300 hover:bg-gold-900/40'}`} title="Click to configure Supabase Storage & Database connection">
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {supabaseConnected ? 'Supabase Live' : 'Demo Local Mode'}
            </span>
            <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
          </button>

          {/* Create Event CTA */}
          <Link href="/events/new" className="flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 font-semibold text-xs sm:text-sm px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all hover:scale-[1.02]">
            <Plus className="w-4 h-4" />
            <span>New Event</span>
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
