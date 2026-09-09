'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/languageContext';
import { Sparkles } from 'lucide-react';

export default function GuestNavbar() {
    const { lang, setLang, t } = useLanguage();

    return (
      <header className="sticky top-0 z-40 w-full border-b border-amber-900/15 bg-[#FCF9F2]/95 backdrop-blur-2xl shadow-sm pt-safe">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Divine Brand Crest */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0 select-none">
            {/* Sacred Deity Emblem */}
            <div className="w-10 h-12 sm:w-11 sm:h-14 rounded-t-2xl rounded-b-md bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 p-[1.5px] shadow-md shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-all duration-300 shrink-0">
              <div className="w-full h-full bg-stone-900 rounded-t-[14px] rounded-b-[4px] overflow-hidden relative border border-amber-200/80">
                <img
                  src="/gangai-logo.jpeg"
                  alt="Sri Gangai Amman"
                  className="w-full h-full object-cover object-top select-none"
                  loading="eager"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-divine text-base sm:text-xl font-bold tracking-[0.14em] text-amber-950 uppercase">
                  {lang === 'ta' ? 'கங்கை' : 'Gangai'}{' '}
                  <span className="divine-gold-text font-serif italic text-lg sm:text-2xl font-bold lowercase tracking-normal">
                    {lang === 'ta' ? 'ஸ்டுடியோ' : 'Studio'}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1 -mt-1">
                <span className="text-[9px] sm:text-[10px] text-amber-800/80 uppercase tracking-[0.2em] font-semibold font-serif truncate max-w-[140px] sm:max-w-none">
                  {t.tagline}
                </span>
                <span className="text-amber-600 text-[8px] sm:text-[10px]">✦</span>
              </div>
            </div>
          </Link>

          {/* Right Action: Language Switcher with >=44px touch targets */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-1 bg-white/95 border border-amber-900/20 rounded-2xl shadow-sm">
              <button
                type="button"
                onClick={() => setLang('ta')}
                className={`min-h-[36px] sm:min-h-[38px] px-3 sm:px-3.5 py-1 rounded-xl text-xs font-serif font-bold transition-all active:scale-95 touch-target flex items-center justify-center ${
                  lang === 'ta'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm'
                    : 'text-amber-900 hover:text-amber-700'
                }`}
                aria-label="Switch to Tamil"
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`min-h-[36px] sm:min-h-[38px] px-3 sm:px-3.5 py-1 rounded-xl text-xs font-divine font-bold transition-all active:scale-95 touch-target flex items-center justify-center ${
                  lang === 'en'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm'
                    : 'text-amber-900 hover:text-amber-700'
                }`}
                aria-label="Switch to English"
              >
                English
              </button>
            </div>
          </div>
        </div>
      </header>
    );
}

