'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEvents, archiveEvent, restoreEvent, deleteEvent } from '@/lib/storageService';
import { Plus, Calendar, MapPin, Image as ImageIcon, Download, Camera, QrCode, Sparkles, ArrowRight, Shield, Trash2, Archive, RotateCcw, AlertTriangle } from 'lucide-react';

export default function HostDashboardPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
    const [actionLoading, setActionLoading] = useState(null);

    async function loadData() {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const activeEvents = events.filter((e) => e.theme_color !== 'archived');
    const archivedEvents = events.filter((e) => e.theme_color === 'archived');

    // Stats calculated strictly from ACTIVE events
    const totalPhotos = activeEvents.reduce((acc, e) => acc + (e.photo_count || 0), 0);
    const totalGuestSnaps = activeEvents.reduce((acc, e) => acc + (e.guest_snap_count || 0), 0);
    const totalDownloads = activeEvents.reduce((acc, e) => acc + (e.total_downloads || 0), 0);

    const displayedEvents = activeTab === 'active' ? activeEvents : archivedEvents;

    const handleArchive = async (e, eventId, title) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Hide and archive "${title}" from the public website?\n\nIt will be removed immediately from the guest portal, but preserved in your Archived History.`)) {
            return;
        }
        setActionLoading(eventId);
        const ok = await archiveEvent(eventId);
        if (ok) {
            setEvents((prev) =>
                prev.map((ev) => (ev.id === eventId ? { ...ev, theme_color: 'archived' } : ev))
            );
        } else {
            alert('Failed to archive event. Please check connection.');
        }
        setActionLoading(null);
    };

    const handleRestore = async (e, eventId, title) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Restore "${title}" to the live guest portal?`)) {
            return;
        }
        setActionLoading(eventId);
        const ok = await restoreEvent(eventId);
        if (ok) {
            setEvents((prev) =>
                prev.map((ev) => (ev.id === eventId ? { ...ev, theme_color: 'champagne' } : ev))
            );
        } else {
            alert('Failed to restore event. Please check connection.');
        }
        setActionLoading(null);
    };

    const handlePermanentDelete = async (e, eventId, title) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`PERMANENTLY DELETE "${title}" and ALL its photos from Supabase database?\n\nWARNING: This action CANNOT be undone.`)) {
            return;
        }
        setActionLoading(eventId);
        const ok = await deleteEvent(eventId);
        if (ok) {
            setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
        } else {
            alert('Failed to delete event. Please check connection.');
        }
        setActionLoading(null);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero / Greeting Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-gold-500/20 p-6 sm:p-8 md:p-10 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        <Sparkles className="w-3.5 h-3.5" />
                        Host Event Command Center
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-100 leading-tight">
                        Curate Moments That <span className="gold-gradient-text italic font-serif">Last Forever</span>
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-stone-400 leading-relaxed">
                        Manage your wedding albums, batch-upload optimized high-res photographs, and generate custom QR table cards for seamless guest photo collecting.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                            href="/events/new"
                            className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-gold-500/20 transition-all hover:scale-105 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Event
                        </Link>
                    </div>
                </div>
            </div>

            {/* Analytics Summary Stats (Computed 100% from Live Active Events) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Events', value: activeEvents.length, icon: Calendar, color: 'text-gold-400' },
                    { label: 'Total High-Res Photos', value: totalPhotos, icon: ImageIcon, color: 'text-amber-400' },
                    { label: 'Guest Candid Snaps', value: totalGuestSnaps, icon: Camera, color: 'text-rose-400' },
                    { label: 'Total Photo Downloads', value: totalDownloads, icon: Download, color: 'text-emerald-400' },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/80 hover:border-gold-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{stat.label}</span>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
                            {loading ? '...' : stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Events List & Tabs */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-3">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-stone-100">Your Events</h2>
                        <p className="text-xs text-stone-400">
                            {activeTab === 'active'
                                ? 'Active events visible on the live guest portal'
                                : 'Archived events hidden from the guest portal'}
                        </p>
                    </div>

                    {/* View Switcher Tabs */}
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-stone-950 border border-stone-800 rounded-xl flex items-center">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    activeTab === 'active'
                                        ? 'bg-gold-500 text-stone-950 shadow-md font-bold'
                                        : 'text-stone-400 hover:text-stone-200'
                                }`}
                            >
                                <span>Active Events</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'active' ? 'bg-stone-950 text-gold-400' : 'bg-stone-800 text-stone-400'}`}>
                                    {activeEvents.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('archived')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    activeTab === 'archived'
                                        ? 'bg-stone-800 text-gold-400 border border-gold-500/30 font-bold'
                                        : 'text-stone-400 hover:text-stone-200'
                                }`}
                            >
                                <Archive className="w-3.5 h-3.5" />
                                <span>Archived History</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900 text-stone-400">
                                    {archivedEvents.length}
                                </span>
                            </button>
                        </div>

                        <Link
                            href="/events/new"
                            className="hidden sm:flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 font-semibold px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-gold-500/30 rounded-xl"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Event</span>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {[1, 2].map((n) => (
                            <div
                                key={n}
                                className="rounded-3xl bg-stone-900/60 border border-gold-500/20 overflow-hidden shadow-xl animate-pulse"
                            >
                                <div className="aspect-[16/9] w-full bg-stone-950 flex items-center justify-center">
                                    <span className="text-3xl animate-bounce">🪔</span>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="h-5 bg-stone-800 rounded-lg w-2/3" />
                                    <div className="h-3 bg-stone-800/60 rounded w-1/3" />
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        <div className="h-10 bg-stone-950 rounded-xl" />
                                        <div className="h-10 bg-stone-950 rounded-xl" />
                                        <div className="h-10 bg-stone-950 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayedEvents.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-stone-900/40 border border-stone-800 text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-stone-800/60 flex items-center justify-center text-xl text-stone-400">
                            {activeTab === 'active' ? '🪔' : '📦'}
                        </div>
                        <h3 className="font-serif text-xl font-bold text-stone-300">
                            {activeTab === 'active' ? 'No active events' : 'No archived events'}
                        </h3>
                        <p className="text-xs text-stone-400 max-w-sm mx-auto">
                            {activeTab === 'active'
                                ? 'Create your first wedding or celebration album to start uploading and sharing!'
                                : 'When you delete/archive an event, it will appear here so you can restore or permanently delete it.'}
                        </p>
                        {activeTab === 'active' && (
                            <Link
                                href="/events/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-stone-950 font-bold rounded-xl text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Create Event
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayedEvents.map((event) => {
                            const isArchived = event.theme_color === 'archived';
                            const isItemLoading = actionLoading === event.id;

                            return (
                                <div
                                    key={event.id}
                                    className={`group rounded-3xl bg-stone-900/80 border overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                                        isArchived
                                            ? 'border-stone-800 opacity-85 hover:opacity-100'
                                            : 'border-stone-800/80 hover:border-gold-500/40 hover:shadow-gold-500/5'
                                    }`}
                                >
                                    {/* Event Cover & Header */}
                                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-950">
                                        {event.cover_image_url ? (
                                            <img
                                                src={event.cover_image_url}
                                                alt={event.title}
                                                className={`w-full h-full object-cover transition-transform duration-500 ${
                                                    isArchived ? 'grayscale-[40%]' : 'group-hover:scale-105'
                                                }`}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center">
                                                <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">🪔</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                                        {/* Badges on Cover */}
                                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                                            <span className="px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-gold-500/30 text-gold-300 text-xs font-semibold">
                                                /{event.slug}
                                            </span>
                                            {isArchived ? (
                                                <span className="px-2.5 py-1 rounded-full bg-red-950/80 text-rose-300 text-[10px] font-semibold border border-rose-800/60 flex items-center gap-1 backdrop-blur-sm">
                                                    <Archive className="w-3 h-3 text-rose-400" />
                                                    Hidden / Archived
                                                </span>
                                            ) : event.passcode ? (
                                                <span className="px-2.5 py-1 rounded-full bg-stone-900/80 text-stone-300 text-[10px] font-mono border border-stone-700 flex items-center gap-1">
                                                    <Shield className="w-3 h-3 text-gold-400" />
                                                    Passcode Protected
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Title & Info on Cover Bottom */}
                                        <div className="absolute bottom-4 left-4 right-4 space-y-1">
                                            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 group-hover:text-gold-300 transition-colors">
                                                {event.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-gold-400" />
                                                    {new Date(event.event_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                {event.location && (
                                                    <span className="flex items-center gap-1 text-stone-400 truncate max-w-[200px]">
                                                        <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                                                        {event.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Event Stats Bar */}
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-950/60 rounded-2xl border border-stone-800 text-center text-xs">
                                            <div>
                                                <span className="text-stone-500 block text-[10px] uppercase">Photos</span>
                                                <span className="font-serif font-bold text-stone-200 text-sm">{event.photo_count || 0}</span>
                                            </div>
                                            <div>
                                                <span className="text-stone-500 block text-[10px] uppercase">Guest Snaps</span>
                                                <span className="font-serif font-bold text-rose-300 text-sm">{event.guest_snap_count || 0}</span>
                                            </div>
                                            <div>
                                                <span className="text-stone-500 block text-[10px] uppercase">Downloads</span>
                                                <span className="font-serif font-bold text-gold-300 text-sm">{event.total_downloads || 0}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {isArchived ? (
                                            <div className="space-y-2">
                                                <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-[11px] text-rose-300 flex items-center gap-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                                                    <span>Hidden from guest portal. Restore to republish.</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={(e) => handleRestore(e, event.id, event.title)}
                                                        disabled={isItemLoading}
                                                        className="py-2 px-3 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span>{isItemLoading ? 'Restoring...' : 'Restore Live'}</span>
                                                    </button>

                                                    <button
                                                        onClick={(e) => handlePermanentDelete(e, event.id, event.title)}
                                                        disabled={isItemLoading}
                                                        className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                                        <span>{isItemLoading ? 'Deleting...' : 'Delete Forever'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <Link
                                                        href={`/events/${event.id}`}
                                                        className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <ImageIcon className="w-3.5 h-3.5 text-gold-400" />
                                                        <span>Photos</span>
                                                    </Link>

                                                    <Link
                                                        href={`/events/${event.id}/upload`}
                                                        className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                                                        <span>Bulk Upload</span>
                                                    </Link>

                                                    <Link
                                                        href={`/events/${event.id}/qr-hub`}
                                                        className="py-2 px-3 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <QrCode className="w-3.5 h-3.5 text-gold-400" />
                                                        <span>QR Card</span>
                                                    </Link>
                                                </div>

                                                <div className="flex items-center justify-end pt-1">
                                                    <button
                                                        onClick={(e) => handleArchive(e, event.id, event.title)}
                                                        disabled={isItemLoading}
                                                        className="text-[11px] text-stone-400 hover:text-rose-400 transition-colors flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-950/20"
                                                        title="Hide and delete from public website (moves to history)"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-stone-500 hover:text-rose-400" />
                                                        <span>{isItemLoading ? 'Archiving...' : 'Delete / Archive Event'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
