// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/app/dashboard/actions"; // NEW: Import the role check

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dashboardRoute, setDashboardRoute] = useState("/client-dashboard"); // NEW: Dynamic route state

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // NEW: If logged in, fetch role and set correct dashboard path
      if (session?.user?.email) {
        const role = await getUserRole(session.user.email);
        setDashboardRoute(role === "ARTIST" ? "/dashboard" : "/client-dashboard");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      
      // NEW: Update route immediately if they switch accounts
      if (session?.user?.email) {
        const role = await getUserRole(session.user.email);
        setDashboardRoute(role === "ARTIST" ? "/dashboard" : "/client-dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side: Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tight">
              ArtComm.
            </Link>
          </div>

          {/* Right side: Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/artists" 
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
            >
              Discover Artists
            </Link>
            
            <div className="hidden sm:flex items-center space-x-4 border-l border-slate-200 pl-6 ml-2">
              
              {/* Conditional Rendering: Logged In vs Logged Out */}
              {user ? (
                <>
                  <Link 
                    href={dashboardRoute} /* NEW: Now uses the dynamic route! */
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition mr-2"
                  >
                    Dashboard
                  </Link>
                  <span className="text-sm text-slate-500 mr-2 border-l border-slate-200 pl-4">
                    {user.email}
                  </span>
                  <button 
                    onClick={handleSignOut}
                    className="text-sm font-medium text-slate-600 hover:text-red-600 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/signup" 
                    className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm"
                  >
                    Sign up
                  </Link>
                </>
              )}
              
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}