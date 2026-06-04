// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserRole, getUserProfile, updateProfile, getArtistCommissions, updateCommissionStatus } from "./actions";
import toast from "react-hot-toast";

type Commission = {
  id: string;
  clientEmail: string;
  details: string;
  budget: string;
  status: string;
  createdAt: Date;
  artistId: string;
};

type Profile = {
  name: string;
  style: string;
  startingPrice: string;
  bio: string;
  portfolio: string[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    style: "",
    startingPrice: "",
    bio: "",
    portfolio: []
  });

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user.email) {
        router.push("/login");
        return;
      }

      const role = await getUserRole(session.user.email);
      if (role !== "ARTIST") {
        router.push("/"); 
        return;
      }

      const userProfile = await getUserProfile(session.user.email);
      if (userProfile) {
        const portfolioData = (userProfile as any).portfolio || [];
        
        setProfile({
          name: userProfile.name || "",
          style: userProfile.style || "",
          startingPrice: userProfile.startingPrice || "",
          bio: userProfile.bio || "",
          portfolio: portfolioData
        });

        const fetchedCommissions = await getArtistCommissions(userProfile.id);
        setCommissions(fetchedCommissions as Commission[]);
      }

      setUserEmail(session.user.email);
      setIsLoading(false);
    };

    checkAccess();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    const uploadedUrls = [...profile.portfolio]; 
    
    for (let i = 1; i <= 4; i++) {
      const file = formData.get(`file${i}`) as File;
      
      if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userEmail.split('@')[0]}-${Date.now()}-${i}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('portfolio')
          .upload(fileName, file);
          
        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('portfolio')
            .getPublicUrl(fileName);
            
          uploadedUrls[i - 1] = publicUrl;
        } else {
          console.error("Upload failed:", error);
          toast.error(`Failed to upload image ${i}`);
        }
      }
    }
    
    formData.set("port1", uploadedUrls[0] || "");
    formData.set("port2", uploadedUrls[1] || "");
    formData.set("port3", uploadedUrls[2] || "");
    formData.set("port4", uploadedUrls[3] || "");
    
    const result = await updateProfile(userEmail, formData);
    
    setIsSaving(false);
    if (result.success) {
      toast.success("Profile and images updated successfully!");
      setProfile(prev => ({ ...prev, portfolio: uploadedUrls }));
    } else {
      toast.error("Something went wrong saving your profile.");
    }
  };

  const handleStatusUpdate = async (commissionId: string, status: "ACCEPTED" | "DECLINED") => {
    // Optimistic UI update
    setCommissions(prev => 
      prev.map(comm => comm.id === commissionId ? { ...comm, status } : comm)
    );

    const result = await updateCommissionStatus(commissionId, status);
    
    if (result.success) {
      toast.success(`Commission ${status.toLowerCase()}!`);
    } else {
      toast.error("Failed to update status on the server.");
      const userProfile = await getUserProfile(userEmail);
      if (userProfile) {
        const refetched = await getArtistCommissions(userProfile.id);
        setCommissions(refetched as Commission[]);
      }
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Artist Dashboard</h1>
          <p className="text-slate-600">Welcome back, {userEmail}.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Settings</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Display Name</label>
                  <input name="name" defaultValue={profile.name} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Art Style</label>
                  <input name="style" defaultValue={profile.style} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Starting Price</label>
                  <input name="startingPrice" defaultValue={profile.startingPrice} placeholder="e.g. ₦25,000" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Short Bio</label>
                  <textarea name="bio" defaultValue={profile.bio} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 resize-none" />
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Upload Portfolio Images</h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num}>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Image {num}</label>
                        {profile.portfolio[num - 1] && (
                          <img 
                            src={profile.portfolio[num - 1]} 
                            alt={`Portfolio ${num}`} 
                            className="h-20 w-32 object-cover rounded-md mb-2 border border-slate-200"
                          />
                        )}
                        <input 
                          type="file" 
                          name={`file${num}`}
                          accept="image/*"
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 mt-6">
                  {isSaving ? "Saving..." : "Save Settings & Images"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                Incoming Requests
                <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">
                  {commissions.length}
                </span>
              </h2>

              {commissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-slate-500 font-medium">No commission requests yet.</p>
                  <p className="text-slate-400 text-sm mt-1">When clients submit the form on your profile, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {commissions.map((req) => (
                    <div key={req.id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition shadow-sm bg-slate-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-900">{req.clientEmail}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          req.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Project Details</h3>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">{req.details}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Budget</span>
                          <span className="font-bold text-emerald-600">{req.budget}</span>
                        </div>
                        {req.status === "PENDING" && (
                          <div className="space-x-3">
                            <button 
                              onClick={() => handleStatusUpdate(req.id, "DECLINED")}
                              className="text-sm font-semibold text-slate-500 hover:text-red-600 transition"
                            >
                              Decline
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(req.id, "ACCEPTED")}
                              className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};