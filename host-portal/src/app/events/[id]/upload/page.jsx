'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventByIdOrSlug } from '@/lib/storageService';
import { ArrowLeft } from 'lucide-react';
import BulkUploader from '@/components/host/BulkUploader';
export default function DirectUploadPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;
    const [event, setEvent] = useState(null);
    useEffect(() => {
        async function load() {
            if (!eventId)
                return;
            const ev = await getEventByIdOrSlug(eventId);
            if (ev)
                setEvent(ev);
        }
        load();
    }, [eventId]);
    if (!event) {
        return <div className="p-12 text-center text-stone-500">Loading uploader...</div>;
    }
    return (<div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/events/${event.id}`} className="p-2 text-stone-400 hover:text-stone-100 rounded-xl hover:bg-stone-900 transition-colors">
          <ArrowLeft className="w-5 h-5"/>
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-100">
            Bulk Photo Uploader - {event.title}
          </h1>
          <p className="text-xs text-stone-400">
            Upload multiple high-res photos. Client compression optimizes images automatically.
          </p>
        </div>
      </div>

      <BulkUploader eventId={event.id} eventSlug={event.slug} onUploadComplete={() => {
            router.push(`/events/${event.id}`);
        }}/>
    </div>);
}
