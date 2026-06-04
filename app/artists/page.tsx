// app/artists/page.tsx
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import Link from "next/link";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function DiscoverArtistsPage() {
  const artists = await prisma.user.findMany({
    where: {
      role: "ARTIST",
    },
    orderBy: {
      createdAt: "desc", 
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Discover Artists</h1>
          <p className="text-xl text-slate-600">Find the perfect creator for your next project.</p>
        </div>

        {artists.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-lg">No artists found. Be the first to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist) => {
              const displayName = artist.name || artist.email.split("@")[0];
              const displayStyle = artist.style || "Digital Artist";
              const displayPrice = artist.startingPrice || "Ask for pricing";
              
              // We cast artist to 'any' here to bypass VS Code's outdated cache
              const portfolioData = (artist as any).portfolio || [];
              const coverImage = portfolioData.length > 0 
                ? portfolioData[0] 
                : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

              return (
                <div key={artist.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">
                  {/* Cover Image */}
                  <div className="h-48 w-full bg-slate-200 relative">
                    <img 
                      src={coverImage} 
                      alt={`Art by ${displayName}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 capitalize">{displayName}</h2>
                        <p className="text-indigo-600 font-medium text-sm">{displayStyle}</p>
                      </div>
                      <div className="bg-slate-100 px-3 py-1 rounded-lg text-right">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Starts at</p>
                        <p className="font-bold text-slate-900">{displayPrice}</p>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm line-clamp-2 mb-6">
                      {artist.bio || "This artist hasn't added a bio yet."}
                    </p>

                    <Link 
                      href={`/artists/${artist.id}`} 
                      className="mt-auto w-full block text-center bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition shadow-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}