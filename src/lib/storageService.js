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

// 4. Guest Candid Photo Upload (Cloudinary + Supabase PostgreSQL)
export async function uploadGuestSnap(eventId, eventSlug, file, guestName = 'A Devotee Guest', caption = '') {
    const isVideo = file.type.startsWith('video');
    let uploadBlob = file;
    let width = 1600;
    let height = 1200;
    let finalSize = file.size;

    if (!isVideo) {
        try {
            const compressed = await compressImage(file, 2048, 0.85);
            uploadBlob = compressed.compressedBlob;
            width = compressed.width;
            height = compressed.height;
            finalSize = compressed.compressedSize;
        } catch (e) {
            console.warn('Client compression skipped:', e);
        }
    }

    let cdnUrl = '';
    let storagePath = `${eventSlug || eventId}/guest_${Date.now()}_${file.name}`;

    // Cloudinary upload
    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        try {
            const formData = new FormData();
            formData.append('file', uploadBlob, file.name);
            formData.append('folder', `gangai_events/${eventSlug || eventId}`);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                const cloudData = await res.json();
                cdnUrl = cloudData.secure_url;
                storagePath = cloudData.public_id;
                width = cloudData.width || width;
                height = cloudData.height || height;
                finalSize = cloudData.bytes || finalSize;
            }
        } catch (err) {
            console.warn('Guest Cloudinary upload error:', err);
        }
    }

    // Fallback: Supabase Storage
    const supabase = getSupabase();
    if (!cdnUrl && supabase) {
        try {
            const fileExt = isVideo ? 'mp4' : 'jpg';
            const fileName = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            storagePath = `${eventSlug || eventId}/${fileName}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('event-photos')
                .upload(storagePath, uploadBlob, {
                    contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
                    cacheControl: '31536000',
                    upsert: true,
                });

            if (!uploadError && uploadData) {
                const { data: cdnData } = supabase.storage
                    .from('event-photos')
                    .getPublicUrl(storagePath);
                cdnUrl = cdnData.publicUrl;
            }
        } catch (e) {
            console.warn('Supabase guest upload error:', e);
        }
    }

    if (!cdnUrl) {
        throw new Error('Upload failed. Please check connection.');
    }

    // Insert into Supabase PostgreSQL photos table
    const { data: photoRow, error: photoError } = await supabase
        .from('photos')
        .insert([
            {
                event_id: eventId,
                storage_path: storagePath,
                cdn_url: cdnUrl,
                thumbnail_url: cdnUrl.includes('cloudinary.com')
                    ? cdnUrl.replace('/upload/', '/upload/w_600,c_scale,q_auto,f_auto/')
                    : cdnUrl,
                caption: caption || 'Divine Moment',
                width,
                height,
                file_size_bytes: finalSize,
                is_featured: false,
                uploader_role: 'guest',
                uploader_name: guestName || 'A Devotee Guest',
            },
        ])
        .select()
        .single();

    if (photoError) {
        console.error('Supabase guest photo insert error:', photoError);
        throw photoError;
    }

    return photoRow;
}

