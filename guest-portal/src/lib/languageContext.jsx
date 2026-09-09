'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
    en: {
        studio_name: 'Gangai Studio',
        tagline: 'Sacred Moment Gallery',
        divine_celebrations: 'Sri Gangai Amman Temple Celebrations',
        temple_and_weddings: 'Sri Gangai Amman Temple Poojas',
        captured_by: 'Captured by Gangai Studio (Sri Ramanathan)',
        sacred_moments: 'Sacred Moments',
        sacred_photostream: 'Sacred Photo Stream',
        curated_by: 'Curated with Devotion by Gangai Studio',
        high_res_photos: 'High-Res Photographs',
        tap_to_view: 'Tap to view in full resolution',
        download: 'Download',
        download_photo: 'Download Photo',
        download_hd_photo: 'Download HD Photo',
        saving: 'Saving...',
        download_all: 'Bulk Save / Download All',
        share_photo: 'Share Photo',
        share_link: 'Share Gallery Link',
        copied: 'Link copied to clipboard!',
        see_more: 'See More',
        see_all: 'See All',
        view_all_photos: 'View All Photos',
        open_gallery: 'Open Gallery',
        scan_and_view: 'Scan & View Sacred Moments',
        event_name: 'Event Name',
        all_events: 'All Celebrations',
        filter_all: 'All',
        filter_poojas: 'Temple Poojas',
        filter_weddings: 'Weddings & Kalyanam',
        filter_special: 'Special Occasions',
        search_events: 'Search event or pooja name...',
        no_events_found: 'No sacred events found matching your search.',
        blessings_welcome: 'Blessings & Welcome',
        preparing_photos: 'Photographs Are Being Blessed & Uploaded',
        preparing_desc: 'Gangai Studio is preparing the divine high-resolution photographs. They will appear here immediately as they are uploaded.',
        om_blessing: '✧ Om Namo Narayana ✧',
        loading_gallery: 'Opening Sacred Darshan...',
        footer_blessing: '✦ Preserved with Devotion & Sacred Artistry by Gangai Studio ✦',
        all_rights_reserved: 'All rights reserved.',
        passcode_protected: 'This celebration is protected by a passcode.',
        enter_passcode: 'Enter Passcode...',
        unlock_gallery: 'Unlock Sacred Gallery',
        not_found: 'Celebration Not Found',
        return_home: 'Return to Studio Gallery',
        swipe_hint: 'Swipe to navigate • Double tap to zoom',
    },
    ta: {
        studio_name: 'கங்கை ஸ்டுடியோ',
        tagline: 'புனித புகைப்படத் தொகுப்பு',
        divine_celebrations: 'ஸ்ரீ கங்கை அம்மன் கோவில் திருவிழா & பூஜைகள்',
        temple_and_weddings: 'ஸ்ரீ கங்கை அம்மன் கோவில் பூஜைகள்',
        captured_by: 'கங்கை ஸ்டுடியோவின் அற்புதப் பதிவுகள் (ஸ்ரீ ராமநாதன்)',
        sacred_moments: 'புனித தருணங்கள்',
        sacred_photostream: 'மங்கள புகைப்படத் தொகுப்பு',
        curated_by: 'கங்கை ஸ்டுடியோவின் பக்தியுடனும் கலைநயத்துடனும்',
        high_res_photos: 'உயர்தர புகைப்படங்கள்',
        tap_to_view: 'முழுத் தெளிவில் காண தொடுக',
        download: 'பதிவிறக்கு',
        download_photo: 'புகைப்படத்தை பதிவிறக்கு',
        download_hd_photo: 'உயர் தெளிவுத்திறனில் பதிவிறக்கு',
        saving: 'பதிவிறக்குகிறது...',
        download_all: 'தொகுப்பாக பதிவிறக்கு',
        share_photo: 'பகிர்க',
        share_link: 'தொகுப்பு இணைப்பைப் பகிர்க',
        copied: 'இணைப்பு நகலெடுக்கப்பட்டது!',
        see_more: 'மேலும் பார்க்க',
        see_all: 'மேலும் காண்க',
        view_all_photos: 'அனைத்து புகைப்படங்களையும் பார்க்க',
        open_gallery: 'படங்களை பார்க்க',
        scan_and_view: 'ஸ்கேன் செய்து பார்க்க',
        event_name: 'நிகழ்வு பெயர்',
        all_events: 'அனைத்து நிகழ்வுகள்',
        filter_all: 'அனைத்தும்',
        filter_poojas: 'கோவில் பூஜைகள்',
        filter_weddings: 'திருமண நிகழ்வுகள்',
        filter_special: 'சிறப்பு திருவிழாக்கள்',
        search_events: 'நிகழ்வு அல்லது பூஜை பெயரைத் தேடுக...',
        no_events_found: 'தேடலுக்குரிய நிகழ்வுகள் ஏதும் காணப்படவில்லை.',
        blessings_welcome: 'இறை ஆசிகளும் நல்வரவும்',
        preparing_photos: 'புகைப்படங்கள் விரைவில் பதிவேற்றப்படும்',
        preparing_desc: 'கங்கை ஸ்டுடியோ உங்கள் நிகழ்வின் உயர்தர புகைப்படங்களை தயார் செய்து வருகிறது. அவை விரைவில் இங்கு காண்பிக்கப்படும்.',
        om_blessing: '✧ ஓம் நமோ நாராயணாய ✧',
        loading_gallery: 'மங்கள தரிசனம் ஏற்றப்படுகிறது...',
        footer_blessing: '✦ கங்கை ஸ்டுடியோவின் பக்தியுடனும் கலைநயத்துடனும் பாதுகாக்கப்பட்ட நினைவுகள் ✦',
        all_rights_reserved: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
        passcode_protected: 'இந்த நிகழ்வு கடவுச்சொல் மூலம் பாதுகாக்கப்பட்டுள்ளது.',
        enter_passcode: 'கடவுச்சொல்லை உள்ளிடவும்...',
        unlock_gallery: 'தொகுப்பைத் திறக்க',
        not_found: 'நிகழ்வு கிடைக்கவில்லை',
        return_home: 'முகப்புப் பக்கத்திற்குச் செல்க',
        swipe_hint: 'நகர்த்த விரலால் இழுக்கவும் • பெரிதாக்க இருமுறை தொடவும்',
    },
};

const LanguageContext = createContext({
    lang: 'ta',
    setLang: () => { },
    t: translations.ta,
});

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState('ta');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('gangai_guest_lang');
            if (saved === 'en' || saved === 'ta') {
                setLangState(saved);
            }
        }
        catch (e) { }
    }, []);

    const setLang = (newLang) => {
        setLangState(newLang);
        try {
            localStorage.setItem('gangai_guest_lang', newLang);
        }
        catch (e) { }
    };

    return (
      <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
        {children}
      </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

