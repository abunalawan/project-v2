// app/artists/[id]/actions.ts
    "use server";

    import { PrismaClient } from "@prisma/client";
    import { PrismaPg } from "@prisma/adapter-pg";
    import { Pool } from "pg";

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    export async function submitCommissionRequest(formData: FormData) {
      try {
        const artistId = formData.get("artistId") as string;
        const clientEmail = formData.get("clientEmail") as string;
        const budget = formData.get("budget") as string;
        const details = formData.get("details") as string;

        await prisma.commission.create({
          data: {
            artistId,
            clientEmail,
            budget,
            details,
            status: "PENDING",
          },
        });
        
        return { success: true };
      } catch (error) {
        console.error("Failed to submit commission:", error);
        return { success: false };
      }
    }
 