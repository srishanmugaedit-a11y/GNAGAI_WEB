'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventByIdOrSlug, getEventPhotos, updateEvent, archiveEvent, restoreEvent, deleteEvent } from '@/lib/storageService';
import { ArrowLeft, Image as ImageIcon, UploadCloud, QrCode, Settings, ExternalLink, Copy, Check, Eye, Trash2, Archive, RotateCcw, AlertTriangle } from 'lucide-react';
import BulkUploader from '@/components/host/BulkUploader';
import PhotoManagerGrid from '@/components/host/PhotoManagerGrid';
import PrintableTableCard from '@/components/host/PrintableTableCard';
export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;
    const [event, setEvent] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [activeTab, setActiveTab] = useState('photos');
    const [loading, setLoading] = useState(true);
    const [copiedLink, setCopiedLink] = useState(false);
    useEffect(() => {
        async function loadData() {
            if (!eventId)
                return;
            const ev = await getEventByIdOrSlug(eventId);
            if (ev) {
                setEvent(ev);
                const p = await getEventPhotos(ev.id);
                setPhotos(p);
            }
            setLoading(false);
        }
        loadData();
    }, [eventId]);
    const guestBase = process.env.NEXT_PUBLIC_GUEST_PORTAL_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001` : 'http://localhost:3001');
    const guestUrl = event ? `${guestBase.replace(/\/$/, '')}/${event.slug}` : guestBase;
    const handleCopyGuestLink = () => {
        navigator.clipboard.writeText(guestUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };
    if (loading) {
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="p-8 rounded-3xl bg-stone-900/60 border border-gold-500/20 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-2xl animate-bounce">
                🪔
              </div>
              <p className="font-serif text-sm font-semibold text-gold-400 animate-pulse">
                Loading Sacred Event Details...
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-[4/5] bg-stone-900/60 border border-stone-800 rounded-2xl" />
              ))}
            </div>
          </div>
        );
    }
    if (!event) {
        return (<div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-300">Event Not Found</h2>
        <Link href="/" className="px-4 py-2 bg-gold-500 text-stone-950 font-bold rounded-xl text-xs">
          Back to Dashboard
        </Link>
      </div>);
    }
    return (<div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 text-stone-400 hover:text-stone-100 rounded-xl hover:bg-stone-900 transition-colors">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <div>
            <span className="text-[11px] font-mono text-gold-400/80">/{event.slug}</span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopyGuestLink} className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium rounded-xl border border-stone-800 transition-colors">
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4 text-gold-400"/>}
            <span>{copiedLink ? 'Copied!' : 'Copy Guest Link'}</span>
          </button>

          <a href={guestUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-semibold rounded-xl transition-all">
            <Eye className="w-4 h-4"/>
            <span>Open Guest Gallery</span>
            <ExternalLink className="w-3 h-3 opacity-60"/>
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-1 no-print overflow-x-auto">
        {[
            { id: 'photos', name: 'Photo Gallery', icon: ImageIcon, count: photos.length },
            { id: 'upload', name: 'Bulk Uploader', icon: UploadCloud },
            { id: 'qr', name: 'QR Table Card Designer', icon: QrCode },
            { id: 'settings', name: 'Event Settings', icon: Settings },
        ].map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gold-500 text-stone-950 shadow-md shadow-gold-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'}`}>
            <tab.icon className="w-4 h-4"/>
            <span>{tab.name}</span>
            {tab.count !== undefined && (<span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-stone-950 text-gold-400' : 'bg-stone-800 text-stone-400'}`}>
                {tab.count}
              </span>)}
          </button>))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'photos' && (<PhotoManagerGrid eventId={event.id} currentCoverUrl={event.cover_image_url} photos={photos} onPhotosChange={setPhotos} onCoverChange={(newCover) => setEvent({ ...event, cover_image_url: newCover })}/>)}

        {activeTab === 'upload' && (<BulkUploader eventId={event.id} eventSlug={event.slug} onUploadComplete={(newPhotos) => {
                setPhotos((prev) => [...newPhotos, ...prev]);
                setActiveTab('photos');
            }}/>)}

        {activeTab === 'qr' && (<PrintableTableCard event={event} guestPortalBaseUrl={guestUrl}/>)}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-stone-900/80 border border-gold-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-xl font-bold text-stone-100">Event Configuration</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold uppercase mb-1">Event Title</label>
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => setEvent({ ...event, title: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold uppercase mb-1">Welcome Note</label>
                  <textarea
                    rows={3}
                    value={event.welcome_message || ''}
                    onChange={(e) => setEvent({ ...event, welcome_message: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span>Allow Guest Candid Snaps</span>
                  <input
                    type="checkbox"
                    checked={event.allow_guest_uploads}
                    onChange={(e) => setEvent({ ...event, allow_guest_uploads: e.target.checked })}
                    className="rounded text-gold-500 focus:ring-gold-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await updateEvent(event.id, {
                      title: event.title,
                      welcome_message: event.welcome_message,
                      allow_guest_uploads: event.allow_guest_uploads,
                    });
                    alert('Settings updated successfully!');
                  }}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold rounded-xl"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Danger Zone: Archive / Delete */}
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold text-stone-100">Danger Zone</h3>
              </div>
              <p className="text-xs text-stone-400">
                Manage event visibility or permanently delete this event and its photographs from the database.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {event.theme_color === 'archived' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Restore this event to the live guest portal?')) {
                        const ok = await restoreEvent(event.id);
                        if (ok) {
                          setEvent({ ...event, theme_color: 'champagne' });
                          alert('Event restored to live guest portal!');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-semibold rounded-xl text-xs flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    Restore to Live Portal
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Hide & archive "${event.title}" from the guest portal?\n\nIt will be hidden from guests immediately, but retained in your host Archived History.`
                        )
                      ) {
                        const ok = await archiveEvent(event.id);
                        if (ok) {
                          setEvent({ ...event, theme_color: 'archived' });
                          alert('Event archived. It is now hidden from the guest portal.');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 font-semibold rounded-xl text-xs flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4 text-amber-400" />
                    Archive / Hide from Guest Portal
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    if (
                      window.confirm(
                        `PERMANENTLY DELETE "${event.title}" and ALL its photos?\n\nWARNING: This cannot be undone.`
                      )
                    ) {
                      const ok = await deleteEvent(event.id);
                      if (ok) {
                        alert('Event deleted permanently.');
                        router.push('/');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-semibold rounded-xl text-xs flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Permanently Delete Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);
}
