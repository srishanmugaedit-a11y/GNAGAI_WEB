import '@/styles/globals.css';
import Navbar from '@/components/shared/Navbar';
export const metadata = {
    title: 'Host Portal | Gangai Studio - Event & Wedding Photography',
    description: 'Manage wedding events, bulk upload high-resolution photos, generate table QR codes, and deliver unforgettable memories.',
};
export default function RootLayout({ children, }) {
    return (<html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-stone-950 text-stone-100 antialiased selection:bg-gold-500/30 selection:text-gold-200">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-stone-900 py-6 text-center text-xs text-stone-600 no-print">
          <p>© {new Date().getFullYear()} Gangai Studio. All rights reserved.</p>
        </footer>
      </body>
    </html>);
}
