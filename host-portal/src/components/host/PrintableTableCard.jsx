'use client';
import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Copy, Check, Sliders, QrCode } from 'lucide-react';
export default function PrintableTableCard({ event, guestPortalBaseUrl }) {
    const defaultGuestUrl = guestPortalBaseUrl ||
        (process.env.NEXT_PUBLIC_GUEST_PORTAL_URL
            ? `${process.env.NEXT_PUBLIC_GUEST_PORTAL_URL.replace(/\/$/, '')}/${event.slug}`
            : (typeof window !== 'undefined'
                ? `${window.location.protocol}//${window.location.hostname}:3001/${event.slug}`
                : `http://localhost:3001/${event.slug}`));
    const [guestUrl, setGuestUrl] = useState(defaultGuestUrl);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef(null);
    const [design, setDesign] = useState({
        title: event.title || 'Gangai Studio',
        subtitle: 'Official Event & Wedding Photography',
        callToAction: "Scan to View & Download Your Photographs",
        instructions: 'Point your phone camera at the QR code to open the gallery directly. No login required.',
        hashtag: `#${(event.slug || 'GangaiStudio').replace(/-/g, '')}`,
        theme: 'gold_luxury',
        cardSize: '4x6',
        showBorders: true,
        showFloralAccents: true,
    });
    const handleCopyLink = () => {
        navigator.clipboard.writeText(guestUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handlePrint = () => {
        window.print();
    };
    // Color schemes for printable card
    const themeStyles = {
        gold_luxury: {
            bg: 'bg-stone-950',
            border: 'border-[#D9A352]',
            accentBorder: 'border-[#D9A352]/40',
            textPrimary: 'text-[#FAF4EB]',
            textAccent: 'text-[#D9A352]',
            textMuted: 'text-[#D8C2A0]',
            qrFg: '#000000',
            qrBg: '#ffffff',
        },
        rose_elegance: {
            bg: 'bg-[#1C1215]',
            border: 'border-[#FB7185]',
            accentBorder: 'border-[#FB7185]/40',
            textPrimary: 'text-[#FFF1F2]',
            textAccent: 'text-[#FB7185]',
            textMuted: 'text-[#FECDD3]',
            qrFg: '#000000',
            qrBg: '#ffffff',
        },
        royal_emerald: {
            bg: 'bg-[#062018]',
            border: 'border-[#34D399]',
            accentBorder: 'border-[#34D399]/40',
            textPrimary: 'text-[#ECFDF5]',
            textAccent: 'text-[#34D399]',
            textMuted: 'text-[#A7F3D0]',
            qrFg: '#000000',
            qrBg: '#ffffff',
        },
        minimal_noir: {
            bg: 'bg-white',
            border: 'border-stone-800',
            accentBorder: 'border-stone-300',
            textPrimary: 'text-stone-900',
            textAccent: 'text-stone-800',
            textMuted: 'text-stone-600',
            qrFg: '#000000',
            qrBg: '#ffffff',
        },
    };
    const currentTheme = themeStyles[design.theme];
    return (<div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-stone-900/80 border border-gold-500/20 rounded-2xl no-print">
        <div className="space-y-1">
          <h4 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-gold-400"/>
            Guest QR Hub & Printable Table Card
          </h4>
          <p className="text-xs text-stone-400">
            Print high-resolution table display cards for your reception tables so guests can scan and share snaps instantly.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button type="button" onClick={handleCopyLink} className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors">
            {copied ? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4"/>}
            <span>{copied ? 'Link Copied!' : 'Copy Guest Link'}</span>
          </button>

          <button type="button" onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-gold-500/20 transition-all hover:scale-105">
            <Printer className="w-4 h-4"/>
            <span>Print 4x6 / A6 Cards</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Designer Customizer Controls + Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customizer Controls */}
        <div className="lg:col-span-5 space-y-5 no-print bg-stone-900/70 border border-gold-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-800">
            <Sliders className="w-4 h-4 text-gold-400"/>
            <h5 className="font-serif text-sm font-bold text-stone-200 uppercase tracking-wider">
              Card Customizer
            </h5>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-2">
              Color & Foil Palette
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
            { id: 'gold_luxury', name: 'Champagne Gold', color: 'bg-gold-500' },
            { id: 'rose_elegance', name: 'Rose Gold', color: 'bg-rose-500' },
            { id: 'royal_emerald', name: 'Royal Emerald', color: 'bg-emerald-500' },
            { id: 'minimal_noir', name: 'Minimal Ivory', color: 'bg-stone-200' },
        ].map((t) => (<button key={t.id} type="button" onClick={() => setDesign((prev) => ({ ...prev, theme: t.id }))} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${design.theme === t.id
                ? 'border-gold-400 bg-gold-500/10 text-stone-100'
                : 'border-stone-800 text-stone-400 hover:border-stone-700'}`}>
                  <span className={`w-3 h-3 rounded-full ${t.color}`}/>
                  <span>{t.name}</span>
                </button>))}
            </div>
          </div>

          {/* Editable Text Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                Headline / Couple Names
              </label>
              <input type="text" value={design.title} onChange={(e) => setDesign((prev) => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-xs text-stone-100 focus:outline-none"/>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                Call to Action Tagline
              </label>
              <input type="text" value={design.callToAction} onChange={(e) => setDesign((prev) => ({ ...prev, callToAction: e.target.value }))} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-xs text-stone-100 focus:outline-none"/>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                Instructions Subtext
              </label>
              <input type="text" value={design.instructions} onChange={(e) => setDesign((prev) => ({ ...prev, instructions: e.target.value }))} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-xs text-stone-100 focus:outline-none"/>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                Event Hashtag
              </label>
              <input type="text" value={design.hashtag} onChange={(e) => setDesign((prev) => ({ ...prev, hashtag: e.target.value }))} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-xs text-stone-100 focus:outline-none"/>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                Custom Guest URL / QR Target
              </label>
              <input type="text" value={guestUrl} onChange={(e) => setGuestUrl(e.target.value)} placeholder="http://localhost:3001/arun-divya-wedding" className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-xs text-stone-100 focus:outline-none"/>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 pt-2 border-t border-stone-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input type="checkbox" checked={design.showFloralAccents} onChange={(e) => setDesign((prev) => ({ ...prev, showFloralAccents: e.target.checked }))} className="rounded border-stone-700 text-gold-500 focus:ring-gold-500"/>
              <span>Floral / Vintage Accents</span>
            </label>
          </div>
        </div>

        {/* Right: Live Interactive Card Preview (Exact 4x6 / A6 aspect ratio) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md printable-card-container">
            <div ref={cardRef} className={`w-full aspect-[4/6] rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden transition-all duration-300 ${currentTheme.bg} ${design.showBorders ? `border-4 ${currentTheme.border}` : ''}`} style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}>
              {/* Inner Luxury Inset Border */}
              {design.showBorders && (<div className={`absolute inset-3 rounded-2xl border ${currentTheme.accentBorder} pointer-events-none`}/>)}

              {/* Top Section */}
              <div className="relative z-10 space-y-1 mt-2">
                {design.showFloralAccents && (<div className={`text-xl ${currentTheme.textAccent} font-serif tracking-widest`}>
                    ❦ ❧
                  </div>)}
                <p className={`text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold ${currentTheme.textMuted}`}>
                  {design.subtitle}
                </p>
                <h2 className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight ${currentTheme.textPrimary} mt-1`}>
                  {design.title}
                </h2>
                <p className={`font-script text-lg sm:text-xl ${currentTheme.textAccent}`}>
                  {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                </p>
              </div>

              {/* Center Section: Dynamic QR Code */}
              <div className="relative z-10 flex flex-col items-center my-3">
                <div className="p-3.5 bg-white rounded-2xl shadow-xl border-2 border-gold-300/40">
                  <QRCodeSVG value={guestUrl} size={160} level="H" includeMargin={false} fgColor="#0c0a09" bgColor="#ffffff"/>
                </div>
                <p className={`mt-3 font-serif text-sm sm:text-base font-bold ${currentTheme.textAccent} max-w-[260px]`}>
                  {design.callToAction}
                </p>
              </div>

              {/* Bottom Section: Instructions & Hashtag */}
              <div className="relative z-10 space-y-2 mb-2">
                <p className={`text-[10px] sm:text-[11px] ${currentTheme.textMuted} max-w-[240px] mx-auto leading-relaxed`}>
                  {design.instructions}
                </p>
                {design.hashtag && (<div className={`inline-block px-3 py-1 rounded-full text-xs font-serif font-semibold border ${currentTheme.accentBorder} ${currentTheme.textPrimary}`}>
                    {design.hashtag}
                  </div>)}
                {design.showFloralAccents && (<div className={`text-xs ${currentTheme.textAccent} opacity-80 pt-1`}>
                    ✧ ✦ ✧
                  </div>)}
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-4 no-print text-center">
            Standard 4" × 6" table-card format. Fits standard acrylic photo stands or picture frames.
          </p>
        </div>
      </div>
    </div>);
}
