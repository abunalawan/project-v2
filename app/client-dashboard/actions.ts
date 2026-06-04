// app/client-dashboard/actions.ts
    "use server";

    import { PrismaClient } from "@prisma/client";
    import { PrismaPg } from "@prisma/adapter-pg";
    import { Pool } from "pg";

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    export async function getClientCommissions(clientEmail: string) {
      try {
        // 1. Fetch all commissions requested by this specific client
        const commissions = await prisma.commission.findMany({
          where: { clientEmail: clientEmail },
          orderBy: { createdAt: "desc" },
        });

        // 2. Safely grab the names of the artists they requested from
        const artistIds = [...new Set(commissions.map(c => c.artistId))];
        const artists = await prisma.user.findMany({
          where: { id: { in: artistIds } },
          select: { id: true, name: true, email: true }
        });

        // 3. Combine the data so the frontend has everything it needs
        return commissions.map(comm => {
          const artist = artists.find(a => a.id === comm.artistId);
          return {
            ...comm,
            artistName: artist?.name || artist?.email?.split('@')[0] || "Unknown Artist"
          };
        });
      } catch (error) {
        console.error("Database error fetching client commissions:", error);
        return [];
      }
    }