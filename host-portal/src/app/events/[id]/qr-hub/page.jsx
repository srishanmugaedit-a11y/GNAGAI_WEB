'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getEventByIdOrSlug } from '@/lib/storageService';
import { ArrowLeft } from 'lucide-react';
import PrintableTableCard from '@/components/host/PrintableTableCard';
export default function DirectQRHubPage() {
    const params = useParams();
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
        return <div className="p-12 text-center text-stone-500">Loading QR Card Hub...</div>;
    }
    return (<div className="space-y-6">
      <div className="flex items-center gap-3 no-print">
        <Link href={`/events/${event.id}`} className="p-2 text-stone-400 hover:text-stone-100 rounded-xl hover:bg-stone-900 transition-colors">
          <ArrowLeft className="w-5 h-5"/>
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-100">
            Printable QR Table Card - {event.title}
          </h1>
          <p className="text-xs text-stone-400">
            Customize 4" × 6" table cards for the venue tables
          </p>
        </div>
      </div>

      <PrintableTableCard event={event}/>
    </div>);
}
