"use client";

import { useState } from "react";
import { categories } from "@/data/mock";

export default function AdminPage() {
  const [eventCategory, setEventCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [photoColor, setPhotoColor] = useState("");
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-wider text-text-primary">ADMIN</h1>

      {/* Create Event */}
      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">CREATE EVENT</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Category</label>
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
            >
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">Name (optional)</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Spring Run"
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent"
            />
          </div>
        </div>
        <button className="mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
          Create Event
        </button>
      </section>

      {/* Upload Photos */}
      <section className="mt-16">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">UPLOAD PHOTOS</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
            >
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="truck">Truck</option>
              <option value="atv">ATV</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">Color (optional)</label>
            <input
              type="text"
              value={photoColor}
              onChange={(e) => setPhotoColor(e.target.value)}
              placeholder="e.g. Red"
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent"
            />
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            // Handle files here when Supabase is connected
            const files = Array.from(e.dataTransfer.files);
            console.log("Dropped files:", files);
          }}
          className={`mt-6 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
            dragActive
              ? "border-accent bg-accent/5"
              : "border-border bg-bg-card hover:border-border-hover"
          }`}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="mt-3 text-sm text-text-secondary">Drag & drop photos here</p>
          <p className="mt-1 text-xs text-text-muted">or click to browse</p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              console.log("Selected files:", files);
            }}
          />
        </div>
      </section>
    </div>
  );
}