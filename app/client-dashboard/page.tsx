// app/client-dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getClientCommissions } from "./actions";
import Link from "next/link";

type ClientCommission = {
  id: string;
  details: string;
  budget: string;
  status: string;
  createdAt: Date;
  artistName: string;
};

export default function ClientDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [commissions, setCommissions] = useState<ClientCommission[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Verify the user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user.email) {
        router.push("/login");
        return;
      }

      setUserEmail(session.user.email);

      // 2. Fetch their specific commission requests
      const fetchedCommissions = await getClientCommissions(session.user.email);
      setCommissions(fetchedCommissions as ClientCommission[]);
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Loading your portal...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Client Portal</h1>
            <p className="text-slate-600">Track your requests, {userEmail}.</p>
          </div>
          <Link href="/artists" className="bg-white border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition shadow-sm">
            Discover More Artists
          </Link>
        </div>

        {/* Commissions Tracking List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Your Orders
            <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">
              {commissions.length}
            </span>
          </h2>

          {commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-slate-500 font-medium">You haven't requested any commissions yet.</p>
              <p className="text-slate-400 text-sm mt-1">Head over to the Discover page to find an artist!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((req) => (
                <div key={req.id} className="border border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition shadow-sm bg-slate-50 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-slate-900 text-lg capitalize">Artist: {req.artistName}</p>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2">{req.details}</p>
                    <p className="text-xs text-slate-400 mt-3 font-medium">
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 px-6 py-4 rounded-lg text-center min-w-[120px] shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Agreed Budget</span>
                    <span className="font-extrabold text-indigo-600 text-xl">{req.budget}</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}