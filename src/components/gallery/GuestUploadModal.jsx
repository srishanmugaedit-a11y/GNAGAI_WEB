'use client';
import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, Sparkles } from 'lucide-react';
import { uploadGuestSnap } from '@/lib/storageService';
import confetti from 'canvas-confetti';
export default function GuestUploadModal({ eventId, eventSlug, onUploadSuccess, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);
    const handleSelectFile = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || isUploading)
            return;
        setIsUploading(true);
        setProgress(30);
        try {
            setProgress(60);
            const photo = await uploadGuestSnap(eventId, eventSlug, file, guestName || 'A Beloved Guest', caption);
            setProgress(100);
            try {
                confetti({
                    particleCount: 70,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#D9A352', '#FB7185', '#34D399'],
                });
            }
            catch (e) { }
            onUploadSuccess(photo);
            setTimeout(() => {
                setIsOpen(false);
                setFile(null);
                setPreviewUrl(null);
                setCaption('');
                setIsUploading(false);
                setProgress(0);
            }, 700);
        }
        catch (err) {
            console.error('Guest upload error:', err);
            alert('Upload failed. Please try again.');
            setIsUploading(false);
        }
    };
    return (<>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-300 text-stone-950 font-bold text-sm sm:text-base rounded-full shadow-2xl shadow-gold-500/40 hover:shadow-gold-500/60 hover:scale-105 active:scale-95 transition-all duration-300">
          <Camera className="w-5 h-5 text-stone-950 stroke-[2.5]"/>
          <span>Add Your Snaps</span>
        </button>
      </div>

      {/* Upload Modal Drawer */}
      {isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-stone-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl shadow-gold-500/10">
            {/* Close */}
            <button onClick={() => {
                if (!isUploading)
                    setIsOpen(false);
            }} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors">
              <X className="w-5 h-5"/>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-2xl text-gold-400">
                <Camera className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-100">Share Your Moment</h3>
                <p className="text-xs text-stone-400">Upload candid memories straight to the guest album</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Picker Box */}
              {!previewUrl ? (<div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-stone-700 hover:border-gold-500/60 rounded-2xl p-6 text-center cursor-pointer bg-stone-950/50 hover:bg-stone-950 transition-all space-y-2">
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleSelectFile} className="hidden"/>
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                    <UploadCloud className="w-6 h-6"/>
                  </div>
                  <p className="text-xs font-semibold text-stone-200">
                    Take a Photo or Choose from Gallery
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Automatically optimized before upload
                  </p>
                </div>) : (<div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-950 border border-stone-800">
                  <img src={previewUrl} alt="Selected" className="w-full h-full object-cover"/>
                  {!isUploading && (<button type="button" onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                    }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black">
                      <X className="w-4 h-4"/>
                    </button>)}
                </div>)}

              {/* Guest Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <input type="text" placeholder="e.g. Priya & Friends" value={guestName} onChange={(e) => setGuestName(e.target.value)} disabled={isUploading} className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none"/>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Add a Warm Wish / Caption
                </label>
                <input type="text" placeholder="e.g. Congratulations to the lovely couple! 💖" value={caption} onChange={(e) => setCaption(e.target.value)} disabled={isUploading} className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none"/>
              </div>

              {/* Uploading progress bar */}
              {isUploading && (<div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-gold-400 font-semibold">
                    <span>Compressing & Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-gold-500 to-amber-300 h-full transition-all duration-300" style={{ width: `${progress}%` }}/>
                  </div>
                </div>)}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" disabled={isUploading} onClick={() => setIsOpen(false)} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-colors">
                  Cancel
                </button>

                <button type="submit" disabled={!file || isUploading} className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 font-bold rounded-xl text-xs shadow-lg shadow-gold-500/20 transition-all disabled:opacity-50">
                  <Sparkles className="w-4 h-4"/>
                  <span>{isUploading ? 'Posting...' : 'Post to Gallery'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </>);
}
