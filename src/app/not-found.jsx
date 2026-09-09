import Link from 'next/link';
export default function NotFound() {
    return (<div className="py-24 text-center space-y-4">
      <h2 className="font-serif text-3xl font-bold text-stone-200">Page Not Found</h2>
      <p className="text-xs text-stone-400">The requested page could not be located.</p>
      <Link href="/" className="px-4 py-2 bg-gold-500 text-stone-950 font-bold rounded-xl text-xs inline-block">
        Return Home
      </Link>
    </div>);
}
