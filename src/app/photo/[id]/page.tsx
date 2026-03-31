"use client";

import Image from "next/image";
import Link from "next/link";
import { getPhotoById, events } from "@/data/mock";
import { useCart } from "@/lib/cart";
import { useState } from "react";

export default function PhotoDetailPage({ params }: { params: { id: string } }) {
  const photo = getPhotoById(params.id);
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  if (!photo) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-muted">Photo not found.</p>
      </div>
    );
  }

  const event = events.find((e) => e.id === photo.event_id);
  const inCart = items.some((item) => item.photo.id === photo.id);

  const handleAdd = () => {
    addItem(photo);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-text-muted transition-colors hover:text-text-secondary">
        ← Back
      </Link>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-bg-card">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={photo.image_url_watermarked}
            alt={`${photo.color} ${photo.vehicle_type}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 960px"
            priority
          />
          {/* Simulated watermark overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rotate-[-25deg] font-display text-6xl tracking-[0.3em] text-white/10 sm:text-8xl">
              THROTTLESHOTS
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs font-medium text-text-secondary capitalize">
                {photo.vehicle_type}
              </span>
              {photo.color && (
                <span className="flex items-center gap-1.5 rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-secondary">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: photo.color.toLowerCase() }} />
                  {photo.color}
                </span>
              )}
            </div>
            {event && <p className="mt-2 text-sm text-text-muted">{event.name}</p>}
          </div>

          <div className="flex items-center gap-4">
            <span className="font-display text-3xl text-text-primary">${photo.price}</span>
            <button
              onClick={handleAdd}
              disabled={inCart}
              className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                inCart
                  ? "bg-bg-elevated text-text-muted cursor-default"
                  : "bg-accent text-white hover:bg-accent-hover active:scale-95"
              }`}
            >
              {added ? "Added!" : inCart ? "In Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}