'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventBySlugOrId, getEventPhotos, downloadPhotoDirect } from '@/lib/storageService';
import { Calendar, Image as ImageIcon, MapPin, Sparkles, ArrowLeft, Download, Share2, Check } from 'lucide-react';
import MasonryGrid from '@/components/gallery/MasonryGrid';
import LightboxModal from '@/components/gallery/LightboxModal';
import SacredLoadingScreen from '@/components/shared/SacredLoadingScreen';
import { useLanguage } from '@/lib/languageContext';
import Link from 'next/link';

export default function GuestEventGalleryPage() {
    const { lang, t } = useLanguage();
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;
    const [event, setEvent] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
    const [passcodeEntered, setPasscodeEntered] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(true);
    const [isBulkDownloading, setIsBulkDownloading] = useState(false);
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        async function loadEventData() {
            if (!slug)
                return;
            try {
                const [ev, _] = await Promise.all([
                    getEventBySlugOrId(slug),
                    new Promise((resolve) => setTimeout(resolve, 2000)),
                ]);
                if (ev) {
                    setEvent(ev);
                    if (ev.passcode && ev.passcode.trim() !== '') {
                        setIsUnlocked(false);
                    }
                    const p = await getEventPhotos(ev.id);
                    setPhotos(p);
                }
            } catch (err) {
                console.error('Error loading event data:', err);
            } finally {
                setLoading(false);
            }
        }
        loadEventData();
    }, [slug]);

    const handleUnlock = (e) => {
        e.preventDefault();
        if (event?.passcode && passcodeEntered.trim() === event.passcode.trim()) {
            setIsUnlocked(true);
        }
        else {
            alert('Incorrect passcode / தவறான கடவுச்சொல்');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Bulk download / trigger save for photos
    const handleBulkDownload = async () => {
        if (photos.length === 0 || isBulkDownloading) return;
        setIsBulkDownloading(true);
        try {
            for (let i = 0; i < Math.min(photos.length, 10); i++) {
                await downloadPhotoDirect(photos[i], event?.title);
                await new Promise((res) => setTimeout(res, 300));
            }
        } catch (e) {
            console.error('Bulk download error:', e);
        } finally {
            setIsBulkDownloading(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `${event?.title || 'Gangai Studio'} - Sacred Photograph Gallery`,
            text: `View sacred moments from ${event?.title || 'Gangai Studio'}:`,
            url: typeof window !== 'undefined' ? window.location.href : '',
        };

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {}
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2000);
        }
    };

    if (loading) {
        return <SacredLoadingScreen subtext={t?.loading_gallery || (lang === 'ta' ? 'மங்கள தரிசனம் ஏற்றப்படுகிறது...' : 'Loading Sacred Darshan & Moments...')} />;
    }

    if (!event) {
        return (
          <div className="py-24 text-center space-y-4 px-4">
            <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border border-amber-500/30 p-[1.5px] bg-gradient-to-tr from-amber-600 to-yellow-300">
              <img src="/gangai-logo.jpeg" alt="Sri Gangai Amman" className="w-full h-full object-cover object-top rounded-full" />
            </div>
            <h2 className="font-divine text-2xl sm:text-3xl font-bold text-amber-950">{t.not_found}</h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
              The sacred celebration link "{slug}" was not found.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 text-stone-950 font-divine font-bold rounded-2xl text-xs shadow-md active:scale-95 transition-all touch-target"
            >
              {t.return_home}
            </button>
          </div>
        );
    }

    // Passcode Gate (if configured)
    if (!isUnlocked) {
        return (
          <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white border border-amber-900/15 rounded-3xl text-center space-y-4 shadow-2xl animate-fade-in mx-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-[2px] shadow-lg shadow-amber-500/25">
              <div className="w-full h-full bg-[#FFFDF7] rounded-full overflow-hidden border border-amber-200/80">
                <img src="/gangai-logo.jpeg" alt="Sri Gangai Amman" className="w-full h-full object-cover object-top scale-110" />
              </div>
            </div>
            <div>
              <h2 className="font-divine text-xl sm:text-2xl font-bold text-amber-950">{event.title}</h2>
              <p className="text-xs text-amber-800/80 mt-1 font-serif">{t.passcode_protected}</p>
            </div>
            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                placeholder={t.enter_passcode}
                value={passcodeEntered}
                onChange={(e) => setPasscodeEntered(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF5EB] border border-amber-900/20 focus:border-amber-600 rounded-xl text-amber-950 text-center text-sm tracking-widest font-mono focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 text-stone-950 font-divine font-bold rounded-xl text-sm shadow-md active:scale-95 touch-target"
              >
                {t.unlock_gallery}
              </button>
            </form>
          </div>
        );
    }

    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in pb-20">
        {/* Mobile-First QR Landing Header Card */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-900/15 shadow-xl bg-gradient-to-br from-[#FFFDF7] via-[#FAF5EB] to-amber-100/30 p-5 sm:p-8 space-y-4">
          {/* Top Bar: Back Link & Share Action */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white border border-amber-900/15 rounded-xl text-xs font-divine font-bold text-amber-950 shadow-sm transition-all active:scale-95 shrink-0 touch-target"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.all_events}</span>
            </Link>

            {/* Share Link */}
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[38px] px-3.5 py-1.5 bg-white/90 hover:bg-white border border-amber-900/15 rounded-xl text-xs font-semibold text-amber-950 flex items-center gap-1.5 shadow-sm active:scale-95 touch-target"
            >
              {isShared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{t.copied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.share_link}</span>
                </>
              )}
            </button>
          </div>

          {/* Event Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl filter drop-shadow-[0_0_6px_rgba(224,122,30,0.5)]">🪔</span>
              <span className="text-[10px] sm:text-[11px] font-divine font-bold uppercase tracking-[0.2em] text-amber-800 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-600/20">
                {t.sacred_moments}
              </span>
            </div>

            <h1 className="font-divine text-2xl sm:text-4xl font-bold tracking-wide text-amber-950 capitalize">
              {event.title}
            </h1>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-700 font-serif pt-1">
              {event.event_date && (
                <div className="flex items-center gap-1 px-3 py-1 bg-white/80 border border-amber-900/15 rounded-xl shadow-sm text-amber-950 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-1 px-3 py-1 bg-white/80 border border-amber-900/15 rounded-xl shadow-sm text-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{event.location}</span>
                </div>
              )}

              <div className="flex items-center gap-1 px-3 py-1 bg-amber-600/10 border border-amber-600/30 rounded-xl shadow-sm text-amber-950 font-semibold font-divine">
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {photos.length} {lang === 'ta' ? 'படங்கள்' : 'Photos'}
                </span>
              </div>
            </div>
          </div>

          {/* Photographer Badge & Bulk Download */}
          <div className="pt-3 border-t border-amber-900/15 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-amber-800/80 font-serif italic">
              {t.captured_by}
            </p>

            {photos.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDownload}
                disabled={isBulkDownloading}
                className="min-h-[40px] px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 text-stone-950 font-divine font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all touch-target"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isBulkDownloading ? t.saving : t.download_all}</span>
              </button>
            )}
          </div>

          {/* Welcome Note */}
          {event.welcome_message && (
            <div className="pt-2 border-t border-amber-900/10">
              <p className="font-serif italic text-amber-900/90 text-xs sm:text-sm leading-relaxed">
                "{event.welcome_message}"
              </p>
            </div>
          )}
        </div>

        {/* 2-Column Responsive Photo Grid with "View All Photos" Expansion */}
        <MasonryGrid
          event={event}
          photos={photos}
          onPhotoClick={(photo, index) => setSelectedPhotoIndex(index)}
        />

        {/* Lightbox Modal with Gestures */}
        {selectedPhotoIndex !== null && (
          <LightboxModal
            event={event}
            photos={photos}
            currentIndex={selectedPhotoIndex}
            onClose={() => setSelectedPhotoIndex(null)}
            onIndexChange={(idx) => setSelectedPhotoIndex(idx)}
          />
        )}
      </div>
    );
}

