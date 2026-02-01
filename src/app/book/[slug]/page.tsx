"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function BookingPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit() {
    setStatus("sending");
    const res = await fetch("/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgSlug: slug,
        clientName,
        phone: phone || undefined,
        email: email || undefined,
        vehicleMake: vehicleMake || undefined,
        vehicleModel: vehicleModel || undefined,
        vehicleYear: vehicleYear || undefined,
        serviceType,
        preferredDate: preferredDate || undefined,
        notes: notes || undefined,
      }),
    });
    setStatus(res.ok ? "ok" : "err");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Book a service</h1>
          <p className="text-sm opacity-70">Request an appointment. The shop will confirm.</p>
        </div>

        <div className="grid gap-3">
          <input className="border rounded-xl px-3 py-3" placeholder="Your name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className="border rounded-xl px-3 py-3" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="border rounded-xl px-3 py-3" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className="border rounded-xl px-3 py-3" placeholder="Make" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} />
            <input className="border rounded-xl px-3 py-3" placeholder="Model" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
            <input className="border rounded-xl px-3 py-3" placeholder="Year" value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} />
          </div>

          <input className="border rounded-xl px-3 py-3" placeholder="Service needed (e.g., oil change, brakes)" value={serviceType} onChange={(e) => setServiceType(e.target.value)} />
          <input className="border rounded-xl px-3 py-3" placeholder="Preferred date/time (optional)" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
          <textarea className="border rounded-xl px-3 py-3 min-h-[110px]" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <button
            className="h-12 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
            disabled={status === "sending" || clientName.length < 2 || serviceType.length < 2}
            onClick={submit}
          >
            {status === "sending" ? "Sending..." : "Send request"}
          </button>

          {status === "ok" && <div className="text-sm text-green-700">Sent! We will contact you soon.</div>}
          {status === "err" && <div className="text-sm text-red-600">Failed to send. Try again.</div>}
        </div>
      </div>
    </div>
  );
}
