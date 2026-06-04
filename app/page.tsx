// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center space-y-8 mt-[-10vh]">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-7xl">
          Bring your concepts to <span className="text-indigo-600">life.</span>
        </h1>
        
        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
          The premier platform for digital illustration, character design, and concept art. Connect directly with independent artists to commission your next masterpiece.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/artists" 
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md text-lg"
          >
            Find an Artist
          </Link>
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition shadow-sm text-lg"
          >
            Join as a Creator
          </Link>
        </div>

        {/* Optional: A subtle trust banner */}
        <div className="pt-16 border-t border-slate-200 mt-16 max-w-xl mx-auto">
          <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">
            Trusted by creators using industry-standard tools
          </p>
          <div className="flex justify-center gap-8 mt-6 opacity-50 grayscale">
            <span className="font-bold text-xl">Clip Studio Paint</span>
            <span className="font-bold text-xl">Krita</span>
            <span className="font-bold text-xl">Photoshop</span>
          </div>
        </div>
      </div>
    </main>
  );
}