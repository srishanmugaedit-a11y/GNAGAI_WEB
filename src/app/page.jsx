'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { getEvents, getAllPhotos, downloadPhotoDirect } from '@/lib/storageService';
import { Calendar, Image as ImageIcon, MapPin, Sparkles, ArrowRight, Download, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import LightboxModal from '@/components/gallery/LightboxModal';
import SacredLoadingScreen from '@/components/shared/SacredLoadingScreen';
import { useLanguage } from '@/lib/languageContext';
import Link from 'next/link';

export default function GuestHomePage() {
  const { lang, t } = useLanguage();
  const [eventsWithPhotos, setEventsWithPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Lightbox modal state
  const [lightboxData, setLightboxData] = useState({
    isOpen: false,
    event: null,
    photos: [],
    index: 0,
  });

  useEffect(() => {
    async function loadGalleryData() {
      try {
        // Enforce 2-second divine splash screen display
        const [events, allPhotos] = await Promise.all([
          getEvents(),
          getAllPhotos(),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);

        if (events && events.length > 0) {
          const mapped = events.map((ev) => {
            const evPhotos = (allPhotos || []).filter((p) => p.event_id === ev.id);
            return {
              ...ev,
              photos: evPhotos,
            };
          });
          setEventsWithPhotos(mapped);
        } else {
          setEventsWithPhotos([]);
        }
      } catch (err) {
        console.error('Failed to load gallery data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGalleryData();
  }, [lang]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const openLightbox = (event, photos, index) => {
    setLightboxData({
      isOpen: true,
      event,
      photos,
      index,
    });
  };

  const handleDownload = async (photo, eventTitle, e) => {
    e.stopPropagation();
    await downloadPhotoDirect(photo, eventTitle);
  };

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    return eventsWithPhotos.filter((ev) => {
      return !searchQuery.trim() ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [eventsWithPhotos, searchQuery]);

  if (loading) {
    return <SacredLoadingScreen subtext={t?.loading_gallery || (lang === 'ta' ? 'மங்கள தரிசனம் ஏற்றப்படுகிறது...' : 'Loading Sacred Darshan & Moments...')} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-20">
      {/* Cultural Hero Banner with Search */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-900/15 shadow-lg bg-gradient-to-br from-[#FFFDF7] via-[#FAF5EB] to-amber-100/30 p-5 sm:p-7 space-y-4">
        <div className="text-center space-y-2.5">
          <div className="flex items-center justify-center">
            <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-t-[44px] rounded-b-2xl bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 p-[2.5px] shadow-xl shadow-amber-900/25">
              <div className="w-full h-full rounded-t-[41px] rounded-b-[13px] overflow-hidden border border-amber-200/80 bg-stone-900">
                <img
                  src="/gangai-logo.jpeg"
                  alt="Sri Gangai Amman"
                  className="w-full h-full object-cover object-top select-none"
                />
              </div>
            </div>
          </div>
          <h1 className="font-divine text-xl sm:text-3xl font-bold tracking-wide text-amber-950">
            {t.temple_and_weddings}
          </h1>
          <p className="text-xs text-amber-800/80 font-serif max-w-md mx-auto">
            {t.scan_and_view}
          </p>
        </div>

        {/* Quick Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_events}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 border border-amber-900/20 focus:border-amber-600 text-xs sm:text-sm text-amber-950 placeholder-stone-400 focus:outline-none shadow-sm font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Amazon/Flipkart Horizontal Mobile Shelves */}
      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center bg-white/80 rounded-3xl border border-amber-900/15 p-6 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border border-amber-500/30">
            <img src="/gangai-logo.jpeg" alt="Sri Gangai Amman" className="w-full h-full object-cover object-top" />
          </div>
          <p className="font-serif text-sm text-amber-950 font-bold">{t.no_events_found}</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {filteredEvents.map((event) => {
            const photos = event.photos || [];
            const previewPhotos = photos.slice(0, 6);
            const remainingCount = Math.max(0, photos.length - previewPhotos.length);

            return (
              <section
                key={event.id}
                className="bg-white/95 border border-amber-900/15 rounded-3xl p-4 sm:p-6 space-y-3.5 shadow-lg shadow-amber-900/5 hover:border-amber-500/40 transition-all duration-300"
              >
                {/* Shelf Header */}
                <div className="flex items-center justify-between gap-3 border-b border-amber-900/10 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 p-[1.5px] shrink-0 shadow-sm">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#FFFDF7]">
                        <img
                          src="/gangai-logo.jpeg"
                          alt="Sri Gangai Amman"
                          className="w-full h-full object-cover object-top scale-110"
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-divine text-base sm:text-xl font-bold text-amber-950 truncate capitalize">
                        {event.title}
                      </h2>
                      <div className="flex items-center gap-2 text-[11px] text-stone-600 font-serif">
                        {event.event_date && (
                          <span className="flex items-center gap-1 text-amber-900 font-medium">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            <span>{formatDate(event.event_date)}</span>
                          </span>
                        )}
                        <span className="text-amber-400">✧</span>
                        <span className="font-semibold text-amber-950">
                          {photos.length} {lang === 'ta' ? 'படங்கள்' : 'photos'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* "See All" Link */}
                  <Link
                    href={`/${event.slug || event.id}`}
                    className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-stone-950 font-divine font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <span>{t.see_all}</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>

                {/* Horizontal Scrolling 4:5 Portrait Cards */}
                {photos.length === 0 ? (
                  <div className="py-8 text-center bg-[#FAF5EB] rounded-2xl border border-amber-900/10 text-stone-500 text-xs font-serif">
                    {t.preparing_photos}
                  </div>
                ) : (
                  <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 -mx-1 px-1">
                    {previewPhotos.map((photo, pIdx) => (
                      <div
                        key={photo.id}
                        onClick={() => openLightbox(event, photos, pIdx)}
                        className="group relative aspect-[4/5] w-[180px] sm:w-[220px] shrink-0 snap-start rounded-2xl overflow-hidden bg-[#FAF5EB] border border-amber-900/15 hover:border-amber-500/60 cursor-pointer shadow-md transition-all duration-300 active:scale-95 select-none"
                      >
                        <img
                          src={photo.thumbnail_url || photo.cdn_url}
                          alt={photo.caption || event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />

                        {/* Bottom Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Gold Filigree Inset Border */}
                        <div className="absolute inset-1.5 rounded-xl border border-amber-400/0 group-hover:border-amber-400/40 pointer-events-none transition-all duration-300" />

                        {/* Card Content Overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-2.5 flex flex-col justify-end gap-1.5 z-10">
                          <p className="text-[11px] text-white font-serif truncate drop-shadow font-medium">
                            {photo.caption || event.title}
                          </p>

                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-amber-300 font-divine font-bold drop-shadow">
                              {lang === 'ta' ? 'காண்க' : 'View'}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => handleDownload(photo, event.title, e)}
                              title={t.download_photo}
                              className="min-w-[32px] min-h-[32px] p-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-400 text-stone-950 active:scale-90 transition-all shrink-0 shadow flex items-center justify-center"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Tactile "See All / மேலும் காண்க" Action Card */}
                    <Link
                      href={`/${event.slug || event.id}`}
                      className="group relative aspect-[4/5] w-[150px] sm:w-[180px] shrink-0 snap-start rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-600/15 to-yellow-500/20 border-2 border-dashed border-amber-600/40 hover:border-amber-500 flex flex-col items-center justify-center text-center p-3 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm select-none"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-600/30 flex items-center justify-center text-xl mb-1.5 text-amber-700 group-hover:scale-110 transition-transform shadow-inner">
                        ✨
                      </div>
                      <p className="font-divine font-bold text-xs sm:text-sm text-amber-950">
                        {t.open_gallery}
                      </p>
                      {remainingCount > 0 && (
                        <span className="text-[10px] text-amber-800 font-serif mt-0.5">
                          +{remainingCount} {lang === 'ta' ? 'படங்கள்' : 'more'}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-900 font-bold font-divine mt-2 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-900/15">
                        <span>{t.see_all}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Global Lightbox Modal */}
      {lightboxData.isOpen && (
        <LightboxModal
          event={lightboxData.event}
          photos={lightboxData.photos}
          currentIndex={lightboxData.index}
          onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
          onIndexChange={(idx) => setLightboxData((prev) => ({ ...prev, index: idx }))}
        />
      )}
    </div>
  );
}

