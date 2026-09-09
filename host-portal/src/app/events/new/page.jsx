'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Image as ImageIcon, X, RefreshCw, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { createEvent, uploadEventPhoto, updateEvent } from '@/lib/storageService';
import { formatBytes } from '@/lib/imageCompressor';
import confetti from 'canvas-confetti';

export default function CreateEventPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatusText, setUploadStatusText] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    
    // Auto-fetch today's date
    const todayDate = new Date().toISOString().split('T')[0];
    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState(todayDate);

    const handleFileSelect = (files) => {
        if (!files || files.length === 0)
            return;
        const fileList = Array.from(files);
        const valid = fileList.filter((f) => f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp|heic)$/i));
        if (valid.length === 0) {
            alert('Please select valid image files (.JPG, .PNG, .WEBP, .HEIC)');
            return;
        }
        const newItems = valid.map((file, idx) => ({
            id: 'sel_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36) + idx,
            file,
            previewUrl: URL.createObjectURL(file),
            caption: selectedPhotos.length === 0 && idx === 0 ? 'Maha Deeparadhanai Alankaram' : '',
            size: file.size,
        }));
        setSelectedPhotos((prev) => [...prev, ...newItems]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePhoto = (id) => {
        setSelectedPhotos((prev) => prev.filter((p) => p.id !== id));
    };

    const updateCaption = (id, caption) => {
        setSelectedPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || isSubmitting)
            return;

        const autoSlug = title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') || `event-${Date.now()}`;

        setIsSubmitting(true);
        setUploadProgress(10);
        setUploadStatusText('Creating sacred event album...');

        try {
            // 1. Create the event row
            const newEvent = await createEvent({
                title: title.trim(),
                slug: autoSlug,
                event_date: eventDate || todayDate,
                location: 'Gangai Studio',
                host_name: 'Gangai Studio (Sri Ramanathan)',
                welcome_message: 'May the divine blessings and sacred grace of the Almighty be with you and your family forever.',
                cover_image_url: undefined,
                allow_guest_uploads: false,
                theme_color: 'champagne',
            });

            // 2. Upload all attached photos directly
            let firstPhotoUrl = '';
            if (selectedPhotos.length > 0) {
                setUploadStatusText(`Uploading ${selectedPhotos.length} high-res photographs...`);
                for (let i = 0; i < selectedPhotos.length; i++) {
                    const item = selectedPhotos[i];
                    const pct = Math.round(15 + ((i + 1) / selectedPhotos.length) * 80);
                    setUploadProgress(pct);
                    setUploadStatusText(`Uploading photo ${i + 1} of ${selectedPhotos.length}: ${item.file.name}...`);
                    try {
                        const uploaded = await uploadEventPhoto(
                            newEvent.id,
                            newEvent.slug,
                            item.file,
                            'host',
                            'Gangai Studio',
                            item.caption || 'Sacred Darshan'
                        );
                        if (i === 0 && uploaded.cdn_url) {
                            firstPhotoUrl = uploaded.cdn_url;
                        }
                    }
                    catch (err) {
                        console.error('Photo upload failed for file:', item.file.name, err);
                    }
                }
                // 3. Update cover image in database
                if (firstPhotoUrl) {
                    try {
                        await updateEvent(newEvent.id, {
                            cover_image_url: firstPhotoUrl,
                            photo_count: selectedPhotos.length,
                        });
                    }
                    catch (e) {
                        console.warn('Cover update error:', e);
                    }
                }
            }

            setUploadProgress(100);
            setUploadStatusText('Album & photographs created successfully!');
            try {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D9A352', '#F4E8D3', '#B88034'],
                });
            }
            catch (e) { }

            setTimeout(() => {
                router.push(`/events/${newEvent.id}`);
            }, 600);
        }
        catch (err) {
            console.error('Error creating event:', err);
            alert('Event creation error: ' + (err.message || 'Please check your connection'));
            setIsSubmitting(false);
        }
    };

    const totalBytes = selectedPhotos.reduce((sum, p) => sum + p.size, 0);

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 text-stone-400 hover:text-stone-100 rounded-xl hover:bg-stone-900 transition-colors">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 flex items-center gap-2">
              <span>Create Event Album & Upload Photos</span>
              <span className="text-xl">🪔</span>
            </h1>
            <p className="text-xs text-stone-400">Enter event name, attach photos and publish your sacred gallery instantly</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-stone-900/80 border border-gold-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* 1. Event Name & Auto-Fetched Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">
                Event / Pooja Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Diwali Pooja / Sri Meenakshi Thirukalyanam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none transition-colors text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                <span>Date (Auto)</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-3 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-stone-200 text-sm focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* 2. Photo Uploader Section */}
          <div className="space-y-3 pt-3 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4"/>
                  <span>Select & Upload Photographs</span>
                </label>
                <p className="text-[11px] text-stone-400">
                  Select or drag & drop high-resolution photographs to upload to this album
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedPhotos.length > 0 && (
                  <span className="text-[11px] text-stone-400">
                    {formatBytes(totalBytes)}
                  </span>
                )}
                <span className="text-xs px-2.5 py-1 bg-gold-500/10 text-gold-400 rounded-full border border-gold-500/20 font-medium">
                  {selectedPhotos.length} photos selected
                </span>
              </div>
            </div>

            {/* Drag & Drop File Picker Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!isSubmitting)
                    fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 space-y-2.5 ${
                isDragging
                  ? 'border-gold-400 bg-gold-500/10 scale-[1.01]'
                  : 'border-stone-700 hover:border-gold-500/60 bg-stone-950/60 hover:bg-stone-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.heic,.webp"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-3xl shadow-sm">
                🪔
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-200">
                  Click to browse or drag & drop photos here
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Supports JPG, PNG, WEBP, HEIC (Photos are uploaded directly to Cloudinary & Supabase)
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-gold-400"/>
                  Select Photos from Device
                </span>
              </div>
            </div>

            {/* Photo Previews & Captions List */}
            {selectedPhotos.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                  <span>Attached Photographs ({selectedPhotos.length}):</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPhotos([])}
                    disabled={isSubmitting}
                    className="text-stone-500 hover:text-stone-300 underline"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                  {selectedPhotos.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex gap-2.5 p-2.5 bg-stone-950 border border-stone-800 rounded-xl relative group hover:border-gold-500/40"
                    >
                      <div className="w-16 h-16 rounded-lg bg-stone-900 overflow-hidden shrink-0 relative">
                        <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover"/>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-gold-500 text-stone-950 text-[9px] font-bold text-center uppercase tracking-wider">
                            Cover
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[11px] text-stone-300 truncate font-medium" title={item.file.name}>
                            {item.file.name}
                          </p>
                          {!isSubmitting && (
                            <button
                              type="button"
                              onClick={() => removePhoto(item.id)}
                              className="text-stone-500 hover:text-stone-200 p-0.5"
                            >
                              <X className="w-3.5 h-3.5"/>
                            </button>
                          )}
                        </div>

                        <span className="text-[10px] text-stone-500">
                          {formatBytes(item.size)}
                        </span>

                        <input
                          type="text"
                          value={item.caption}
                          onChange={(e) => updateCaption(item.id, e.target.value)}
                          placeholder="e.g. Alankaram / Pooja stage..."
                          disabled={isSubmitting}
                          className="mt-1 w-full px-2 py-0.5 bg-stone-900 border border-stone-800 focus:border-gold-500 text-[10px] text-stone-200 placeholder-stone-600 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress Bar (during submission) */}
          {isSubmitting && (
            <div className="p-4 bg-stone-950 rounded-2xl border border-gold-500/30 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-medium text-gold-400">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin"/>
                  <span>{uploadStatusText}</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-gold-500 to-amber-300 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <Link href="/" className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 font-bold rounded-xl text-sm shadow-lg shadow-gold-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin"/>
                  <span>Creating & Uploading...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4"/>
                  <span>
                    Create Album & Upload {selectedPhotos.length > 0 ? `(${selectedPhotos.length} Photos)` : ''}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
}
