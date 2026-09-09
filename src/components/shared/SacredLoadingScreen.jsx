'use client';
import React from 'react';
import { useLanguage } from '@/lib/languageContext';
import { Sparkles } from 'lucide-react';

export default function SacredLoadingScreen({ subtext }) {
    const { lang } = useLanguage();

    return (
        <div className="min-h-[70vh] sm:min-h-[75vh] w-full flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in select-none">
            {/* Ambient Background Aura */}
            <div className="relative flex flex-col items-center max-w-lg w-full text-center">
                <div className="absolute -inset-10 bg-radial from-amber-500/15 via-amber-700/5 to-transparent blur-3xl pointer-events-none rounded-full" />

                {/* Layered Sacred Temple Frame with Crystal Clear Deity Photo */}
                <div className="relative mb-6 flex items-center justify-center">
                    {/* Ambient Aura & Radiant Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-yellow-400/25 to-amber-600/10 rounded-full blur-2xl animate-sacred-glow" />

                    {/* Stately Temple Arched Medallion - Edge-to-Edge Fit */}
                    <div className="relative w-48 h-64 sm:w-56 sm:h-76 rounded-t-[96px] rounded-b-3xl bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 p-[3px] shadow-2xl shadow-amber-900/35 overflow-hidden">
                        <div className="w-full h-full rounded-t-[92px] rounded-b-[21px] overflow-hidden relative border-2 border-amber-200/80 bg-stone-900">
                            <img
                                src="/gangai-logo.jpeg"
                                alt="Sri Gangai Amman"
                                className="w-full h-full object-cover object-top select-none"
                                loading="eager"
                            />
                            {/* Subtle gold inner rim shimmer */}
                            <div className="absolute inset-0 rounded-t-[92px] rounded-b-[21px] ring-1 ring-inset ring-amber-400/40 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* 1. Studio Name (Above) */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-900/5 border border-amber-900/15 text-amber-900 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>GANGAI STUDIO • கங்கை ஸ்டுடியோ</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                </div>

                {/* 2. Temple Name (English) */}
                <h1 className="font-divine text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider text-amber-950 uppercase leading-tight">
                    SRI GANGAI AMMAN TEMPLE
                </h1>

                {/* 3. Temple Name (Tamil - Below) */}
                <div className="mt-2 inline-block px-4 py-1.5 rounded-2xl bg-gradient-to-r from-red-950/10 via-amber-900/15 to-red-950/10 border border-amber-900/20">
                    <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-amber-900 tracking-wide">
                        ஸ்ரீ கங்கை அம்மன் கோவில்
                    </h2>
                </div>

                {/* Sacred Tagline / Blessing */}
                <p className="mt-3 text-xs sm:text-sm font-serif text-amber-800/80 tracking-widest uppercase">
                    ✦ Sacred Photography & Celebrations Gallery ✦
                </p>

                {/* Shimmering Progress Bar */}
                <div className="mt-8 w-48 sm:w-64 h-1.5 bg-amber-900/10 rounded-full overflow-hidden p-[1px] border border-amber-900/15">
                    <div className="h-full rounded-full animate-divine-shimmer w-full" />
                </div>

                {/* Loading Status Text */}
                <p className="mt-3 font-serif text-xs text-amber-900 font-semibold animate-pulse tracking-wider">
                    {subtext || (lang === 'ta' ? 'மங்கள தரிசனம் ஏற்றப்படுகிறது...' : 'Loading Sacred Darshan & Moments...')}
                </p>
            </div>
        </div>
    );
}
