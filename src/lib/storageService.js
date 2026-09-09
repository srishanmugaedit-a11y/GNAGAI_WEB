import { getSupabase } from './supabase';
import { compressImage } from './imageCompressor';

// Clean any stale legacy localStorage items on initial load
if (typeof window !== 'undefined') {
    try {
        localStorage.removeItem('gangai_events_store');
        localStorage.removeItem('gangai_photos_store');
    } catch (e) {}
}

// 0. Fetch All Events directly from Supabase PostgreSQL (Active only)
export async function getEvents() {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('events')
            .select('*, photos(id, cdn_url, thumbnail_url, uploader_role, caption)')
            .neq('theme_color', 'archived')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch events error:', error);
            return [];
        }

        if (data) {
            return data.map((ev) => {
                const photoList = ev.photos || [];
                const guestList = photoList.filter((p) => p.uploader_role === 'guest');
                const realCover = (ev.cover_image_url && !ev.cover_image_url.includes('unsplash'))
                    ? ev.cover_image_url
                    : (photoList.length > 0 ? photoList[0].cdn_url : null);

                return {
                    ...ev,
                    cover_image_url: realCover,
                    photo_count: photoList.length,
                    guest_snap_count: guestList.length,
                };
            });
        }
    } catch (e) {
        console.error('Supabase fetch events error:', e);
    }
    return [];
}

// 0.1 Fetch All Photos directly from Supabase PostgreSQL
export async function getAllPhotos() {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch all photos error:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('Supabase fetch all photos error:', e);
        return [];
    }
}

// 1. Fetch Event by Slug or ID directly from Supabase PostgreSQL
export async function getEventBySlugOrId(slugOrId) {
    if (!slugOrId) return null;
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        // First check by slug
        const { data: bySlug } = await supabase
            .from('events')
            .select('*')
            .eq('slug', slugOrId)
            .maybeSingle();

        if (bySlug) return bySlug;

        // If not found and it looks like a valid UUID, query by id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
        if (isUuid) {
            const { data: byId } = await supabase
                .from('events')
                .select('*')
                .eq('id', slugOrId)
                .maybeSingle();

            if (byId) return byId;
        }
    } catch (e) {
        console.error('Supabase fetch event error:', e);
    }
    return null;
}

// 2. Fetch Photos for an Event directly from Supabase PostgreSQL
export async function getEventPhotos(eventId) {
    const supabase = getSupabase();
    if (!supabase || !eventId) return [];

    try {
        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase getEventPhotos error:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('Supabase getEventPhotos error:', e);
        return [];
    }
}

// 3. Direct High-Resolution Photo Download Trigger
export async function downloadPhotoDirect(photo, eventTitle = 'GangaiStudio') {
    if (!photo || !photo.cdn_url) return;
    try {
        const response = await fetch(photo.cdn_url, { mode: 'cors' });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const cleanTitle = (eventTitle || 'SacredMoment').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${cleanTitle}_GangaiStudio_${Date.now()}.jpg`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        // Track download count in Supabase
        const supabase = getSupabase();
        if (supabase && photo.id) {
            supabase.rpc('increment_photo_download', { photo_id: photo.id }).then(() => {}).catch(() => {});
        }
    } catch (e) {
        window.open(photo.cdn_url, '_blank');
    }
}
