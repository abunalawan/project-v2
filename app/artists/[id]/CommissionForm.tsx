// app/artists/[id]/CommissionForm.tsx
"use client";

import { useState } from "react";
import { submitCommissionRequest } from "./actions";
import toast from "react-hot-toast";

export default function CommissionForm({ artistId }: { artistId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center shadow-sm">
        <h3 className="font-bold text-lg mb-1">Request Sent!</h3>
        <p className="text-sm">The artist will review your project and email you soon.</p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition shadow-md text-lg"
      >
        Request Commission
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("artistId", artistId);
    
    const result = await submitCommissionRequest(formData);
    
    if (result.success) {
      setIsSuccess(true);
      toast.success("Request sent successfully!");
    } else {
      toast.error("Something went wrong sending your request.");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full sm:min-w-[400px] bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-4 text-left">
      <h3 className="font-bold text-slate-900 text-lg border-b border-slate-200 pb-2 mb-4">
        Commission Details
      </h3>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Your Email</label>
        <input name="clientEmail" type="email" required placeholder="you@example.com" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600" />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Project Budget</label>
        <input name="budget" type="text" required placeholder="e.g. ₦30,000" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600" />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Project Description</label>
        <textarea name="details" required rows={4} placeholder="Describe what you want me to draw, colors, vibes, etc..." className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 resize-none"></textarea>
      </div>
      
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
          {isSubmitting ? "Sending..." : "Send Request"}
        </button>
      </div>
    </form>
  );
}