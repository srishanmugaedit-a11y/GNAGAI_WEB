import { getSupabase } from './supabase';
import { compressImage } from './imageCompressor';

// Clean any stale legacy localStorage items on initial load
if (typeof window !== 'undefined') {
    try {
        localStorage.removeItem('gangai_events_store');
        localStorage.removeItem('gangai_photos_store');
    } catch (e) {}
}

// 1. Fetch All Events directly from Supabase PostgreSQL
export async function getEvents() {
    const supabase = getSupabase();
    if (!supabase) return [];
    
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*, photos(id, cdn_url, thumbnail_url, uploader_role, caption)')
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
        console.error('Supabase getEvents exception:', e);
    }
    return [];
}

// 2. Fetch Single Event by ID or Slug directly from Supabase
export async function getEventByIdOrSlug(idOrSlug) {
    if (!idOrSlug) return null;
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        // Check by slug first
        const { data: bySlug } = await supabase
            .from('events')
            .select('*')
            .eq('slug', idOrSlug)
            .maybeSingle();

        if (bySlug) return bySlug;

        // If not found and it's a valid UUID, query by id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        if (isUuid) {
            const { data: byId } = await supabase
                .from('events')
                .select('*')
                .eq('id', idOrSlug)
                .maybeSingle();

            if (byId) return byId;
        }
    } catch (e) {
        console.error('Supabase getEventByIdOrSlug error:', e);
    }
    return null;
}

// 3. Create Event in Supabase PostgreSQL
export async function createEvent(eventData) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { data, error } = await supabase
        .from('events')
        .insert([
            {
                title: eventData.title,
                slug: eventData.slug,
                event_date: eventData.event_date,
                location: eventData.location,
                welcome_message: eventData.welcome_message,
                host_name: eventData.host_name,
                cover_image_url: eventData.cover_image_url,
                allow_guest_uploads: eventData.allow_guest_uploads,
                passcode: eventData.passcode,
                theme_color: eventData.theme_color,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Supabase createEvent error:', error);
        throw error;
    }
    return data;
}

// 3.1 Update Event in Supabase PostgreSQL
export async function updateEvent(id, updates) {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase updateEvent error:', error);
            return null;
        }
        return data;
    } catch (e) {
        console.error('Supabase updateEvent exception:', e);
        return null;
    }
}

// 4. Archive Event (Hides from guest website while preserving in Host History)
export async function archiveEvent(id) {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('events')
            .update({ theme_color: 'archived' })
            .eq('id', id);

        if (error) {
            console.error('Supabase archiveEvent error:', error);
            return false;
        }
        return true;
    } catch (e) {
        console.error('Supabase archiveEvent exception:', e);
        return false;
    }
}

// 4.1 Restore Archived Event (Brings back to public website)
export async function restoreEvent(id) {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('events')
            .update({ theme_color: 'champagne' })
            .eq('id', id);

        if (error) {
            console.error('Supabase restoreEvent error:', error);
            return false;
        }
        return true;
    } catch (e) {
        console.error('Supabase restoreEvent exception:', e);
        return false;
    }
}

// 5. Permanently Delete Event and All Associated Photos from Supabase
export async function deleteEvent(id) {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        // Delete related photos from database first
        await supabase.from('photos').delete().eq('event_id', id);
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) {
            console.error('Supabase deleteEvent error:', error);
            return false;
        }
        return true;
    } catch (e) {
        console.error('Supabase deleteEvent error:', e);
        return false;
    }
}

// 5.1 Delete Single Photo from Supabase PostgreSQL
export async function deleteEventPhoto(photoId, storagePath) {
    const supabase = getSupabase();
    if (!supabase || !photoId) return false;

    try {
        const { error } = await supabase.from('photos').delete().eq('id', photoId);
        if (error) {
            console.error('Supabase deleteEventPhoto error:', error);
            return false;
        }
        if (storagePath) {
            supabase.storage.from('event-photos').remove([storagePath]).catch(() => {});
        }
        return true;
    } catch (e) {
        console.error('Supabase deleteEventPhoto exception:', e);
        return false;
    }
}

// 6. Fetch Photos for an Event from Supabase PostgreSQL
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
        console.error('Supabase getEventPhotos exception:', e);
        return [];
    }
}

// 7. Fetch All Photos across all events
export async function getAllPhotos() {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase getAllPhotos error:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('Supabase getAllPhotos exception:', e);
        return [];
    }
}

// 8. Upload Photo with Client Compression (Cloudinary / Supabase Storage + PostgreSQL)
export async function uploadEventPhoto(eventId, eventSlug, file, uploaderRole = 'host', uploaderName = 'Gangai Studio', caption = '') {
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
    let storagePath = `${eventSlug || eventId}/${Date.now()}_${file.name}`;

    // Option A: Try Cloudinary API Route
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
            console.warn('Cloudinary upload error:', err);
        }
    }

    // Option B: Supabase Storage Bucket fallback
    const supabase = getSupabase();
    if (!cdnUrl && supabase) {
        try {
            const fileExt = isVideo ? 'mp4' : 'jpg';
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
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
            console.warn('Supabase storage upload error:', e);
        }
    }

    if (!cdnUrl) {
        throw new Error('Image upload failed. Please verify your Cloudinary or Supabase connection.');
    }

    // Save Structured Row in Supabase PostgreSQL
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
                caption: caption || 'Sacred Darshan',
                width,
                height,
                file_size_bytes: finalSize,
                is_featured: false,
                uploader_role: uploaderRole,
                uploader_name: uploaderName,
            },
        ])
        .select()
        .single();

    if (photoError) {
        console.error('Supabase photo insert error:', photoError);
        throw photoError;
    }

    return photoRow;
}

// 9. Direct High-Resolution Photo Download Trigger
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

        // Track download in Supabase
        const supabase = getSupabase();
        if (supabase && photo.id) {
            supabase.rpc('increment_photo_download', { photo_id: photo.id }).then(() => {}).catch(() => {});
        }
    } catch (e) {
        // Fallback: Direct window open
        window.open(photo.cdn_url, '_blank');
    }
}
