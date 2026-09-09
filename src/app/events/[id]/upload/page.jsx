'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventByIdOrSlug } from '@/lib/storageService';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import BulkUploader from '@/components/host/BulkUploader';

export default function DirectUploadPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params?.id;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            if (!eventId) return;
            try {
                const ev = await getEventByIdOrSlug(eventId);
                if (isMounted && ev) {
                    setEvent(ev);
                }
            } catch (err) {
                console.error('Failed to load event for upload:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        load();
        return () => { isMounted = false; };
    }, [eventId]);

    if (loading) {
        return (
            <div className="p-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
                <p className="font-serif text-sm font-semibold text-stone-300">
                    Loading Sacred Event Uploader...
                </p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="p-16 text-center space-y-4">
                <h3 className="font-serif text-xl font-bold text-stone-200">Event Not Found</h3>
                <p className="text-xs text-stone-400">The event could not be loaded or may have been deleted.</p>
                <Link href="/" className="inline-block px-4 py-2 bg-gold-500 text-stone-950 font-bold rounded-xl text-xs">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto px-2 sm:px-0">
            <div className="flex items-center gap-3">
                <Link href={`/events/${event.slug || event.id}`} className="p-2 text-stone-400 hover:text-stone-100 rounded-xl hover:bg-stone-900 transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                </Link>
                <div>
                    <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                        Bulk Photo Uploader - {event.title}
                    </h1>
                    <p className="text-xs text-stone-400">
                        Upload multiple high-res photos. Client compression optimizes images automatically.
                    </p>
                </div>
            </div>

            <BulkUploader 
                eventId={event.id} 
                eventSlug={event.slug} 
                onUploadComplete={() => {
                    router.push(`/events/${event.slug || event.id}`);
                }}
            />
        </div>
    );
}

