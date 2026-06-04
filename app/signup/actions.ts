// app/signup/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function syncUserToDatabase(email: string, role: "CLIENT" | "ARTIST") {
  try {
    console.log(`Attempting to create ${role} in database:`, email);
    
    await prisma.user.create({
      data: {
        email: email,
        role: role,
      },
    });
    
    console.log("Successfully created user in database!");
    return { success: true };
  } catch (error) {
    console.error("Failed to save user to Prisma database:", error);
    return { success: false };
  }
}