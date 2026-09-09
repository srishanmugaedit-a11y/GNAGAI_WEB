import { createClient } from '@supabase/supabase-js';
let supabaseInstance = null;
export function getSupabaseCredentials() {
    if (typeof window !== 'undefined') {
        const customUrl = localStorage.getItem('gangai_supabase_url');
        const customKey = localStorage.getItem('gangai_supabase_key');
        if (customUrl && customKey) {
            return { url: customUrl, key: customKey, isCustom: true };
        }
    }
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (envUrl && envKey && !envUrl.includes('your-project-id')) {
        return { url: envUrl, key: envKey, isCustom: false };
    }
    return null;
}
export function isSupabaseConfigured() {
    return getSupabaseCredentials() !== null;
}
export function getSupabase() {
    const creds = getSupabaseCredentials();
    if (!creds)
        return null;
    if (!supabaseInstance) {
        supabaseInstance = createClient(creds.url, creds.key);
    }
    return supabaseInstance;
}
