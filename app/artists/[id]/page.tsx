// app/artists/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { notFound } from "next/navigation";
import CommissionForm from "./CommissionForm"; // <-- 1. We import our interactive form here

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const artist = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!artist) {
    notFound();
  }

  // We cast to 'any' here just to keep VS Code's TypeScript cache from panicking
  const portfolioUrls = (artist as any).portfolio || [];

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 capitalize">{artist.name || "Unknown Artist"}</h1>
          <p className="text-xl text-indigo-600 font-medium mt-2">{artist.style || "Digital Artist"}</p>
        </div>

        {/* Portfolio Gallery Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Portfolio
            <span className="bg-slate-200 text-slate-600 text-sm py-1 px-3 rounded-full">
              {portfolioUrls.length}
            </span>
          </h2>
          
          {portfolioUrls.length === 0 ? (
            <div className="bg-white border border-slate-200 h-64 rounded-xl flex items-center justify-center shadow-sm">
              <p className="text-slate-500 font-medium">No artwork uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioUrls.map((url: string, index: number) => (
                <div key={index} className="aspect-square bg-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer">
                  <img 
                    src={url} 
                    alt={`Artwork ${index + 1} by ${artist.name}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bio & Pricing Section */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">About the Artist</h2>
          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-lg">
            {artist.bio || "This artist hasn't added a bio yet."}
          </p>
          
          <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Starting Price</h3>
              <p className="text-3xl font-extrabold text-slate-900">{artist.startingPrice || "N/A"}</p>
            </div>
            
            {/* 2. We replace the dead button with our real component, passing it the artist's ID */}
            <CommissionForm artistId={artist.id} />
          </div>
        </div>

      </div>
    </main>
  );
}