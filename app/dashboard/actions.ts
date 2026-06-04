// app/dashboard/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function getUserRole(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });
    return user?.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

export async function getUserProfile(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateProfile(email: string, formData: FormData) {
  try {
    const url1 = formData.get("port1") as string;
    const url2 = formData.get("port2") as string;
    const url3 = formData.get("port3") as string;
    const url4 = formData.get("port4") as string;

    const portfolioUrls = [url1, url2, url3, url4].filter(url => url && url.length > 0);

    await prisma.user.update({
      where: { email },
      data: {
        name: formData.get("name") as string,
        style: formData.get("style") as string,
        startingPrice: formData.get("startingPrice") as string,
        bio: formData.get("bio") as string,
        portfolio: portfolioUrls, 
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false };
  }
}

export async function getArtistCommissions(artistId: string) {
  try {
    return await prisma.commission.findMany({
      where: { artistId: artistId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Database error fetching commissions:", error);
    return [];
  }
}

// NEW: Update the status of an incoming commission request
export async function updateCommissionStatus(commissionId: string, newStatus: "ACCEPTED" | "DECLINED") {
  try {
    await prisma.commission.update({
      where: { id: commissionId },
      data: { status: newStatus },
    });
    return { success: true };
  } catch (error) {
    console.error("Database error updating commission status:", error);
    return { success: false };
  }
}