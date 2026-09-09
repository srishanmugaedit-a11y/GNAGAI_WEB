-- ==============================================================================
-- GANGAI MOMENTS: SUPABASE POSTGRESQL DATABASE & STORAGE SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  event_date DATE NOT NULL,
  location TEXT,
  welcome_message TEXT DEFAULT 'Welcome to our celebration! Please enjoy and share your favorite moments with us.',
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT DEFAULT 'Event Host',
  cover_image_url TEXT,
  allow_guest_uploads BOOLEAN DEFAULT true,
  passcode TEXT, -- Optional guest upload/view passcode
  theme_color TEXT DEFAULT 'champagne' -- champagne, rose_gold, emerald, midnight
);

-- 2. Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  storage_path TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INT,
  height INT,
  file_size_bytes BIGINT,
  uploader_role TEXT CHECK (uploader_role IN ('host', 'guest')) DEFAULT 'host' NOT NULL,
  uploader_name TEXT DEFAULT 'Host',
  caption TEXT,
  is_featured BOOLEAN DEFAULT false,
  download_count INT DEFAULT 0,
  likes_count INT DEFAULT 0
);

-- 3. Photo Likes (for Guest Interactive Reactions)
CREATE TABLE IF NOT EXISTS public.photo_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
  guest_device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (photo_id, guest_device_id)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON public.photos (event_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_uploader ON public.photos (uploader_role);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;

-- Events Policies
CREATE POLICY "Public can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Hosts can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = host_id OR host_id IS NULL);

CREATE POLICY "Hosts can update their events" ON public.events
  FOR UPDATE USING (auth.uid() = host_id OR host_id IS NULL);

CREATE POLICY "Hosts can delete their events" ON public.events
  FOR DELETE USING (auth.uid() = host_id OR host_id IS NULL);

-- Photos Policies
CREATE POLICY "Public can view photos" ON public.photos
  FOR SELECT USING (true);

CREATE POLICY "Allow photo inserts" ON public.photos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Hosts can update photo metadata" ON public.photos
  FOR UPDATE USING (true);

CREATE POLICY "Hosts can delete photos" ON public.photos
  FOR DELETE USING (true);

-- Photo Likes Policies
CREATE POLICY "Public can view and create likes" ON public.photo_likes
  FOR ALL USING (true);

-- 5. Storage Bucket Configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to event-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-photos');

CREATE POLICY "Allow public upload to event-photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-photos');

CREATE POLICY "Allow delete from event-photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-photos');
