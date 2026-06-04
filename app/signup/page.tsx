// app/signup/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { syncUserToDatabase } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "ARTIST">("CLIENT");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Create the Supabase Login
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setIsLoading(false);
      return;
    }

    // 2. Save the Profile to Prisma
    if (data.user && data.user.email) {
      const result = await syncUserToDatabase(data.user.email, role);
      
      if (result.success) {
        alert("Account created successfully!");
        // Route them to the right place based on their role
        if (role === "ARTIST") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } else {
        alert("Failed to create database profile.");
      }
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Create an Account</h1>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900"
  required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
             type="password" 
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900"
  required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">I am a...</label>
            <select 
             value={role} 
  onChange={(e) => setRole(e.target.value as "CLIENT" | "ARTIST")}
  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900"
>
  <option value="CLIENT">Client (Looking to hire)</option>
  <option value="ARTIST">Artist (Looking for work)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="text-indigo-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}