'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, Sparkles, Check } from 'lucide-react';
import { downloadPhotoDirect } from '@/lib/storageService';
import { useLanguage } from '@/lib/languageContext';

export default function LightboxModal({ event, photos, currentIndex, onClose, onIndexChange }) {
    const { lang, t } = useLanguage();
    const currentPhoto = photos[currentIndex];
    const [isDownloading, setIsDownloading] = useState(false);
    const [isShared, setIsShared] = useState(false);
    
    // Touch swipe handling
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchEndX = useRef(0);
    const touchEndY = useRef(0);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') {
            if (currentIndex < photos.length - 1) onIndexChange(currentIndex + 1);
        }
        if (e.key === 'ArrowLeft') {
            if (currentIndex > 0) onIndexChange(currentIndex - 1);
        }
    }, [currentIndex, photos.length, onClose, onIndexChange]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    if (!currentPhoto) return null;

    const handleNext = () => {
        if (currentIndex < photos.length - 1) onIndexChange(currentIndex + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) onIndexChange(currentIndex - 1);
    };

    // Mobile touch gesture handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        touchEndX.current = e.changedTouches[0].clientX;
        touchEndY.current = e.changedTouches[0].clientY;
        
        const deltaX = touchStartX.current - touchEndX.current;
        const deltaY = touchStartY.current - touchEndY.current;

        // Horizontal swipe (left = next, right = prev)
        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0 && currentIndex < photos.length - 1) {
                handleNext();
            } else if (deltaX < 0 && currentIndex > 0) {
                handlePrev();
            }
        }
        // Vertical swipe down to dismiss
        else if (deltaY < -65 && Math.abs(deltaY) > Math.abs(deltaX)) {
            onClose();
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadPhotoDirect(currentPhoto, event?.title);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `${event?.title || 'Gangai Studio'} - Sacred Photograph`,
            text: `View sacred photographs from ${event?.title || 'Gangai Studio'}:`,
            url: typeof window !== 'undefined' ? window.location.href : '',
        };

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                // user cancelled or share failed
            }
        }
        // Fallback: Copy link
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2000);
        }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0B0907]/98 backdrop-blur-3xl animate-fade-in select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top App Bar (Sticky, Safe Inset) */}
        <div className="pt-safe px-4 py-3 sm:p-5 flex items-center justify-between z-30 bg-gradient-to-b from-[#0B0907] via-[#0B0907]/80 to-transparent">
          {/* Left: Diya & Counter */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl filter drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]">🪔</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-divine text-xs font-bold">
                {currentIndex + 1} / {photos.length}
              </span>
              <span className="font-serif italic text-amber-200/80 text-xs hidden sm:inline truncate max-w-xs">
                {event?.title}
              </span>
            </div>
          </div>

          {/* Right: Close button */}
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 flex items-center justify-center transition-all active:scale-90 touch-target"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Photo Container with Swipe Area */}
        <div className="relative flex-1 w-full flex items-center justify-center px-2 sm:px-12 py-2 overflow-hidden">
          {/* Desktop/Tablet Left Arrow */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-amber-500 hover:text-stone-950 text-amber-200 border border-amber-500/30 items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Desktop/Tablet Right Arrow */}
          {currentIndex < photos.length - 1 && (
            <button
              onClick={handleNext}
              className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-amber-500 hover:text-stone-950 text-amber-200 border border-amber-500/30 items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* High-Resolution Photo Frame */}
          <div className="relative max-w-full max-h-full flex items-center justify-center p-1">
            <img
              src={currentPhoto.cdn_url}
              alt={currentPhoto.caption || 'Sacred Photograph'}
              className="max-h-[66dvh] sm:max-h-[76dvh] max-w-full w-auto object-contain rounded-2xl shadow-2xl shadow-black border border-amber-500/20 transition-transform duration-200"
            />
          </div>
        </div>

        {/* Sticky Mobile Bottom Action Sheet */}
        <div className="pb-safe px-4 pt-3 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/95 to-transparent z-30 space-y-3">
          {/* Photo Caption / Hint */}
          <div className="text-center px-2">
            <p className="font-serif italic text-xs sm:text-sm text-amber-100/90 truncate max-w-lg mx-auto">
              {currentPhoto.caption || (lang === 'ta' ? 'கங்கை ஸ்டுடியோ மங்களப் பதிவு' : 'Gangai Studio Sacred Moment')}
            </p>
            <p className="text-[10px] text-stone-400/80 font-sans mt-0.5 sm:hidden">
              {t.swipe_hint}
            </p>
          </div>

          {/* Bottom Action Pill Bar (Minimum 44px height) */}
          <div className="flex items-center justify-center gap-2.5 max-w-md mx-auto pb-2">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="min-h-[44px] px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 touch-target shadow-lg"
              title={t.share_photo}
            >
              {isShared ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{t.copied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>{t.share_photo}</span>
                </>
              )}
            </button>

            {/* Direct Download HD Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="min-h-[44px] flex-1 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-stone-950 font-divine text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all touch-target"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isDownloading ? t.saving : t.download_hd_photo}</span>
            </button>
          </div>
        </div>
      </div>
    );
}

