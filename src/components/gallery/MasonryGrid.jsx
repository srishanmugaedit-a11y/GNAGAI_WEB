'use client';
import React, { useState } from 'react';
import { Download, ChevronDown, Sparkles, Image as ImageIcon } from 'lucide-react';
import { downloadPhotoDirect } from '@/lib/storageService';
import { useLanguage } from '@/lib/languageContext';

export default function MasonryGrid({ event, photos, onPhotoClick }) {
    const { lang, t } = useLanguage();
    const [visibleCount, setVisibleCount] = useState(12);

    const handleDownload = async (photo, e) => {
        e.stopPropagation();
        await downloadPhotoDirect(photo, event?.title);
    };

    const visiblePhotos = photos.slice(0, visibleCount);
    const hasMore = photos.length > visibleCount;

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Album Sub-Header Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-amber-900/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-lg sm:text-xl">🪔</span>
            <div>
              <h3 className="font-divine text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-amber-950">
                {t.sacred_photostream}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-800/80 font-serif">
                {t.curated_by}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-600/25 text-amber-950 text-xs font-divine font-semibold shadow-sm">
            {photos.length} {lang === 'ta' ? 'படங்கள்' : 'Photos'}
          </span>
        </div>

        {/* 2-Column Mobile-First Photo Grid */}
        {photos.length === 0 ? (
          <div className="py-20 text-center divine-card-light rounded-3xl border border-amber-900/20 p-6 sm:p-8 space-y-3 max-w-md mx-auto shadow-xl bg-white/90">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-600/30 flex items-center justify-center text-3xl shadow-sm animate-sacred-glow">
              🪔
            </div>
            <div>
              <span className="text-amber-700 text-xs font-divine uppercase tracking-[0.2em] block mb-1 font-semibold">
                {t.blessings_welcome}
              </span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-amber-950">
                {t.preparing_photos}
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-serif">
              {t.preparing_desc}
            </p>
            <div className="pt-2 text-amber-700 font-serif text-xs sm:text-sm italic font-medium">
              {t.om_blessing}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {visiblePhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => onPhotoClick(photo, index)}
                  className="group relative aspect-[3/4] sm:aspect-square rounded-2xl overflow-hidden bg-[#FAF5EB] border border-amber-900/15 hover:border-amber-500/60 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl active:scale-95 select-none"
                >
                  {/* Photo with Blur-Up Background */}
                  <img
                    src={photo.thumbnail_url || photo.cdn_url}
                    alt={photo.caption || 'Sacred Photograph'}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  
                  {/* Subtle Gradient Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Gold Filigree Inset Frame */}
                  <div className="absolute inset-1 rounded-xl border border-amber-400/0 group-hover:border-amber-400/40 pointer-events-none transition-all duration-300" />

                  {/* Card Content & Download Button */}
                  <div className="absolute bottom-0 inset-x-0 p-2.5 flex items-end justify-between gap-1.5 z-10">
                    <p className="font-serif text-[11px] text-white truncate max-w-[70%] drop-shadow leading-tight">
                      {photo.caption || (lang === 'ta' ? 'கங்கை ஸ்டுடியோ' : 'Gangai Studio')}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => handleDownload(photo, e)}
                      title={t.download_photo}
                      className="min-w-[34px] min-h-[34px] p-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold text-[10px] shadow-lg active:scale-90 transition-all shrink-0 flex items-center justify-center touch-target"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Expandable "View All Photos" Button */}
            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 16)}
                  className="min-h-[44px] inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-stone-950 font-divine font-bold text-xs sm:text-sm shadow-xl shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer touch-target"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {lang === 'ta'
                      ? `மேலும் புகைப்படங்கள் (+${photos.length - visibleCount})`
                      : `View All Photos (+${photos.length - visibleCount})`}
                  </span>
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </button>
                <p className="text-[11px] text-stone-500 font-serif mt-2">
                  {lang === 'ta'
                    ? `${photos.length} புகைப்படங்களில் ${visibleCount} காட்டப்பட்டுள்ளது`
                    : `Showing ${visibleCount} of ${photos.length} high-resolution photographs`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    );
}

