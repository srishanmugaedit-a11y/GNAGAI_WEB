'use client';
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventBySlugOrId } from '@/lib/storageService';
import { Sparkles } from 'lucide-react';
export default function EventIdRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    useEffect(() => {
        async function redirect() {
            if (!id)
                return;
            const ev = await getEventBySlugOrId(id);
            if (ev) {
                router.replace(`/${ev.slug}`);
            }
            else {
                router.replace('/');
            }
        }
        redirect();
    }, [id, router]);
    return (<div className="py-32 text-center text-stone-500 animate-pulse space-y-3">
      <Sparkles className="w-8 h-8 text-gold-400 mx-auto animate-spin"/>
      <p className="font-serif text-lg text-stone-300">Redirecting to event gallery...</p>
    </div>);
}
