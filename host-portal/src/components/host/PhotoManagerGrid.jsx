'use client';
import React, { useState } from 'react';
import { Trash2, Star, Download, Heart, CheckSquare, Square, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '@/lib/imageCompressor';
import { deleteEventPhoto, updateEvent } from '@/lib/storageService';
export default function PhotoManagerGrid({ eventId, currentCoverUrl, photos, onPhotosChange, onCoverChange, }) {
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const filteredPhotos = photos.filter((p) => {
        if (filter === 'host')
            return p.uploader_role === 'host';
        if (filter === 'guest')
            return p.uploader_role === 'guest';
        return true;
    });
    const toggleSelect = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };
    const selectAll = () => {
        if (selectedIds.length === filteredPhotos.length) {
            setSelectedIds([]);
        }
        else {
            setSelectedIds(filteredPhotos.map((p) => p.id));
        }
    };
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0 || isDeleting)
            return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} photo(s)?`))
            return;
        setIsDeleting(true);
        for (const id of selectedIds) {
            const p = photos.find((x) => x.id === id);
            await deleteEventPhoto(id, p?.storage_path);
        }
        const remaining = photos.filter((p) => !selectedIds.includes(p.id));
        onPhotosChange(remaining);
        setSelectedIds([]);
        setIsDeleting(false);
    };
    const handleSetCover = async (photoUrl) => {
        await updateEvent(eventId, { cover_image_url: photoUrl });
        if (onCoverChange)
            onCoverChange(photoUrl);
    };
    return (<div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-stone-900/80 border border-gold-500/20 rounded-2xl">
        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'all'
            ? 'bg-gold-500 text-stone-950 font-semibold shadow'
            : 'text-stone-400 hover:text-stone-200'}`}>
            All ({photos.length})
          </button>
          <button onClick={() => setFilter('host')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'host'
            ? 'bg-gold-500 text-stone-950 font-semibold shadow'
            : 'text-stone-400 hover:text-stone-200'}`}>
            Official ({photos.filter((p) => p.uploader_role === 'host').length})
          </button>
          <button onClick={() => setFilter('guest')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'guest'
            ? 'bg-gold-500 text-stone-950 font-semibold shadow'
            : 'text-stone-400 hover:text-stone-200'}`}>
            Guest Snaps ({photos.filter((p) => p.uploader_role === 'guest').length})
          </button>
        </div>

        {/* Selection Actions */}
        <div className="flex items-center gap-2.5">
          <button onClick={selectAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium transition-colors">
            {selectedIds.length === filteredPhotos.length && filteredPhotos.length > 0 ? (<CheckSquare className="w-4 h-4 text-gold-400"/>) : (<Square className="w-4 h-4"/>)}
            Select All
          </button>

          {selectedIds.length > 0 && (<button onClick={handleDeleteSelected} disabled={isDeleting} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium shadow transition-all disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5"/>
              <span>Delete Selected ({selectedIds.length})</span>
            </button>)}
        </div>
      </div>

      {/* Grid */}
      {filteredPhotos.length === 0 ? (<div className="text-center py-16 bg-stone-900/40 rounded-3xl border border-stone-800">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-800/80 flex items-center justify-center text-stone-500 mb-3">
            <ImageIcon className="w-7 h-7"/>
          </div>
          <h4 className="font-serif text-lg text-stone-300 font-semibold mb-1">No photos in this view</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Use the Bulk Uploader above to add high-res photos to this wedding event.
          </p>
        </div>) : (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {filteredPhotos.map((photo) => {
                const isCover = currentCoverUrl === photo.cdn_url;
                const isSelected = selectedIds.includes(photo.id);
                return (<div key={photo.id} className={`group relative rounded-2xl overflow-hidden bg-stone-900 border transition-all duration-300 ${isSelected
                        ? 'border-gold-400 ring-2 ring-gold-400/30 scale-[0.98]'
                        : isCover
                            ? 'border-gold-500/80 shadow-lg shadow-gold-500/10'
                            : 'border-stone-800/80 hover:border-gold-500/40 hover:shadow-xl'}`}>
                {/* Photo Image */}
                <div className="aspect-[4/5] relative bg-stone-950 overflow-hidden cursor-pointer" onClick={() => setPreviewPhoto(photo)}>
                  <img src={photo.thumbnail_url || photo.cdn_url} alt={photo.caption || 'Wedding Photo'} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                </div>

                {/* Top Badge: Selection & Role */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(photo.id);
                    }} className="pointer-events-auto p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-gold-500 hover:text-stone-950 transition-colors">
                    {isSelected ? (<CheckSquare className="w-4 h-4 text-gold-400"/>) : (<Square className="w-4 h-4 opacity-70"/>)}
                  </button>

                  {isCover && (<span className="px-2 py-0.5 rounded-full bg-gold-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider shadow">
                      Cover
                    </span>)}
                  {!isCover && photo.uploader_role === 'guest' && (<span className="px-2 py-0.5 rounded-full bg-rose-500/80 backdrop-blur-md text-white text-[10px] font-medium shadow">
                      Guest
                    </span>)}
                </div>

                {/* Bottom Overlay Info & Actions */}
                <div className="p-2.5 bg-stone-900/90 border-t border-stone-800 flex flex-col justify-between gap-1 text-xs">
                  <p className="text-[11px] text-stone-300 truncate font-medium">
                    {photo.caption || (photo.uploader_role === 'guest' ? `By ${photo.uploader_name}` : 'Official Photo')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                    <span>{photo.file_size_bytes ? formatBytes(photo.file_size_bytes) : 'Optimized'}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-rose-400">
                        <Heart className="w-3 h-3 fill-rose-400/20"/>
                        {photo.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-0.5 text-gold-400">
                        <Download className="w-3 h-3"/>
                        {photo.download_count || 0}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action: Set Cover */}
                  {!isCover && (<button type="button" onClick={() => handleSetCover(photo.cdn_url)} className="mt-1 w-full py-1 rounded-lg bg-stone-800 hover:bg-gold-500/20 text-stone-300 hover:text-gold-400 text-[10px] font-medium transition-colors flex items-center justify-center gap-1">
                      <Star className="w-3 h-3"/>
                      Set as Cover
                    </button>)}
                </div>
              </div>);
            })}
        </div>)}

      {/* Lightbox Preview Modal */}
      {previewPhoto && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setPreviewPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img src={previewPhoto.cdn_url} alt="Preview" className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-gold-500/30"/>
            {previewPhoto.caption && (<p className="mt-3 text-sm text-stone-200 text-center font-serif">
                {previewPhoto.caption}
              </p>)}
          </div>
        </div>)}
    </div>);
}
