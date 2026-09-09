'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, X, CheckCircle2, RefreshCw, Sparkles, User } from 'lucide-react';
import { formatBytes } from '@/lib/imageCompressor';
import { uploadEventPhoto } from '@/lib/storageService';
import confetti from 'canvas-confetti';
export default function BulkUploader({ eventId, eventSlug, onUploadComplete }) {
    const [uploaderName, setUploaderName] = useState('Gangai Studio (Sri Ramanathan)');
    const [queue, setQueue] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadingAll, setIsUploadingAll] = useState(false);
    const fileInputRef = useRef(null);
    const handleFiles = useCallback((files) => {
        const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i));
        const newItems = fileArray.map((file) => ({
            id: 'up_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            file,
            previewUrl: URL.createObjectURL(file),
            originalSize: file.size,
            progress: 0,
            status: 'compressing',
        }));
        setQueue((prev) => [...prev, ...newItems]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };
    const removeQueueItem = (id) => {
        setQueue((prev) => prev.filter((item) => item.id !== id));
    };
    const updateCaption = (id, caption) => {
        setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, caption } : item)));
    };
    const processUploadQueue = async () => {
        if (queue.length === 0 || isUploadingAll)
            return;
        setIsUploadingAll(true);
        const uploadedPhotos = [];
        for (let i = 0; i < queue.length; i++) {
            const item = queue[i];
            if (item.status === 'completed')
                continue;
            try {
                setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: 'compressing', progress: 35 } : q));
                setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: 'uploading', progress: 70 } : q));
                const photo = await uploadEventPhoto(eventId, eventSlug, item.file, 'host', uploaderName || 'Gangai Studio', item.caption || 'Sacred Darshan');
                uploadedPhotos.push(photo);
                setQueue((prev) => prev.map((q) => q.id === item.id
                    ? {
                        ...q,
                        status: 'completed',
                        progress: 100,
                        compressedSize: photo.file_size_bytes,
                    }
                    : q));
            }
            catch (err) {
                console.error('Upload failed for item:', item.file.name, err);
                setQueue((prev) => prev.map((q) => q.id === item.id
                    ? {
                        ...q,
                        status: 'error',
                        progress: 0,
                        errorMsg: err.message || 'Upload failed',
                    }
                    : q));
            }
        }
        setIsUploadingAll(false);
        if (uploadedPhotos.length > 0) {
            try {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D9A352', '#F4E8D3', '#B88034'],
                });
            }
            catch (e) { }
            if (onUploadComplete) {
                onUploadComplete(uploadedPhotos);
            }
        }
    };
    const completedCount = queue.filter((q) => q.status === 'completed').length;
    const totalOriginalSize = queue.reduce((acc, q) => acc + q.originalSize, 0);
    return (<div className="space-y-6">
      {/* Uploader Name Input Header */}
      <div className="p-4 sm:p-5 bg-stone-900/90 border border-gold-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4"/>
            <span>Photographer / Uploader Name</span>
          </label>
          <p className="text-xs text-stone-400">
            This name will be credited on all photos uploaded in this session.
          </p>
        </div>

        <input type="text" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} placeholder="e.g. Gangai Studio (Sri Ramanathan)" className="w-full sm:w-80 px-3.5 py-2 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none font-medium"/>
      </div>

      {/* Drag & Drop Zone */}
      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`relative cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${isDragging
            ? 'border-gold-400 bg-gold-500/10 scale-[1.01]'
            : 'border-stone-800 hover:border-gold-500/50 bg-stone-900/50 hover:bg-stone-900/80'}`}>
        <input ref={fileInputRef} type="file" multiple accept="image/*,.heic,.webp" onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden"/>

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600/20 to-gold-400/20 border border-gold-500/30 flex items-center justify-center text-3xl mb-1 shadow-lg shadow-gold-500/10">
            🪔
          </div>
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-semibold text-stone-100 mb-1">
              Select Sacred Pooja & Event Photographs
            </h4>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
              Select high-resolution photos (.JPG, .PNG, .WEBP, .HEIC). Photos will be automatically uploaded directly to Cloudinary and Supabase.
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors">
            <ImageIcon className="w-3.5 h-3.5 text-gold-400"/>
            Browse Files from Device
          </span>
        </div>
      </div>

      {/* Upload Queue Details & Batch Actions */}
      {queue.length > 0 && (<div className="bg-stone-900/80 border border-gold-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div>
              <h5 className="font-serif text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Upload Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-sans">
                  {completedCount} / {queue.length} uploaded
                </span>
              </h5>
              <p className="text-xs text-stone-400">
                Total payload size: {formatBytes(totalOriginalSize)}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => setQueue([])} disabled={isUploadingAll} className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50">
                Clear Queue
              </button>

              <button type="button" onClick={processUploadQueue} disabled={isUploadingAll || completedCount === queue.length} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-gold-500/20 transition-all disabled:opacity-50">
                {isUploadingAll ? (<>
                    <RefreshCw className="w-4 h-4 animate-spin"/>
                    <span>Uploading to Cloud...</span>
                  </>) : (<>
                    <Sparkles className="w-4 h-4"/>
                    <span>Upload {queue.length - completedCount} Photos</span>
                  </>)}
              </button>
            </div>
          </div>

          {/* Queue Item Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto pr-1">
            {queue.map((item) => (<div key={item.id} className="flex gap-3 p-3 bg-stone-950/80 border border-stone-800/80 rounded-xl relative group hover:border-gold-500/30 transition-all">
                {/* Image Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-stone-900 overflow-hidden shrink-0 relative">
                  <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover"/>
                  {item.status === 'completed' && (<div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400"/>
                    </div>)}
                </div>

                {/* Info & Caption */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-medium text-stone-200 truncate" title={item.file.name}>
                      {item.file.name}
                    </p>
                    {item.status !== 'completed' && !isUploadingAll && (<button onClick={() => removeQueueItem(item.id)} className="text-stone-500 hover:text-stone-300 p-0.5 rounded">
                        <X className="w-3.5 h-3.5"/>
                      </button>)}
                  </div>

                  <p className="text-[11px] text-stone-500">
                    {formatBytes(item.originalSize)}
                    {item.compressedSize && (<span className="text-gold-400 ml-1">
                        → {formatBytes(item.compressedSize)}
                      </span>)}
                  </p>

                  {/* Caption Input for Deity Alankaram / Pooja stage */}
                  <input type="text" value={item.caption || ''} onChange={(e) => updateCaption(item.id, e.target.value)} placeholder="e.g. Deeparadhanai Alankaram..." disabled={item.status === 'completed' || isUploadingAll} className="mt-1 w-full px-2 py-1 bg-stone-900 border border-stone-800 focus:border-gold-500 text-[11px] text-stone-200 placeholder-stone-600 rounded focus:outline-none"/>

                  {/* Progress Bar */}
                  {item.status !== 'completed' && (<div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-gold-500 to-amber-300 h-full transition-all duration-300" style={{ width: `${item.progress}%` }}/>
                    </div>)}
                </div>
              </div>))}
          </div>
        </div>)}
    </div>);
}
