"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListingPage() {
  const r = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "err">("idle");

  async function submit() {
    setStatus("sending");
    const res = await fetch("/api/public/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        price: price || undefined,
        sellerName,
        sellerPhone: sellerPhone || undefined,
        sellerEmail: sellerEmail || undefined,
        location: location || undefined,
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      setStatus("err");
      return;
    }
    r.push(`/market/${j.listingId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">New listing</h1>
          <p className="text-sm opacity-70">Add details. Photos will come later.</p>
        </div>

        <div className="grid gap-3">
          <input className="border rounded-xl px-3 py-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="border rounded-xl px-3 py-3 min-h-[120px]" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className="border rounded-xl px-3 py-3" placeholder="Price (USD)" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input className="border rounded-xl px-3 py-3" placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className="border rounded-xl px-3 py-3" placeholder="Your name" value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
            <input className="border rounded-xl px-3 py-3" placeholder="Phone (optional)" value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} />
          </div>
          <input className="border rounded-xl px-3 py-3" placeholder="Email (optional)" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} />

          <button
            className="h-12 rounded-xl bg-slate-900 text-white font-medium disabled:opacity-50"
            disabled={status === "sending" || title.length < 3 || sellerName.length < 2}
            onClick={submit}
          >
            {status === "sending" ? "Posting..." : "Post listing"}
          </button>

          {status === "err" && <div className="text-sm text-red-600">Failed to post.</div>}
        </div>
      </div>
    </div>
  );
}
