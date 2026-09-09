import '@/styles/globals.css';
import GuestNavbar from '@/components/shared/Navbar';
import { LanguageProvider } from '@/lib/languageContext';

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    viewportFit: 'cover',
    themeColor: '#FCF9F2',
};

export const metadata = {
    title: 'Gangai Studio | Sacred Event & Wedding Photo Gallery | கங்கை ஸ்டுடியோ',
    description: 'View and download high-resolution event and wedding photographs captured by Gangai Studio. கங்கை ஸ்டுடியோவின் உயர்தர புகைப்படங்கள்.',
};

export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body className="min-h-[100dvh] flex flex-col bg-[#FCF9F2] text-[#2B1B10] antialiased selection:bg-amber-200 selection:text-amber-950">
          <LanguageProvider>
            <GuestNavbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8">
              {children}
            </main>
            <footer className="border-t border-amber-900/10 py-6 sm:py-8 text-center text-xs text-stone-600 bg-[#F7F2E7]/80 pb-safe">
              <p className="font-divine tracking-widest text-[10px] sm:text-[11px] text-amber-900 uppercase">
                ✦ Preserved with Devotion & Sacred Artistry by Gangai Studio ✦
              </p>
              <p className="mt-1 text-[10px] sm:text-[11px] text-stone-500 font-serif">
                கங்கை ஸ்டுடியோ • © {new Date().getFullYear()} All rights reserved.
              </p>
            </footer>
          </LanguageProvider>
        </body>
      </html>
    );
}

