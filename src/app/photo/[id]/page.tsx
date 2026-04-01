"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart";

interface Photo {
  id: string;
  event_id: string;
  image_url_watermarked: string;
  thumbnail_url: string;
  vehicle_type: string;
  color: string;
  price: number;
}

interface EventRow {
  id: string;
  name: string;
  category_id: string;
  date: string;
}

interface CategoryRow {
  name: string;
  slug: string;
}

export default function PhotoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [siblings, setSiblings] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addItem, items, isFull } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    loadPhoto();
  }, [params.id]);

  // Close lightbox on escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const loadPhoto = async () => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("id", params.id)
      .single();

    if (data) {
      setPhoto(data);

      const { data: evt } = await supabase
        .from("events")
        .select("id, name, category_id, date")
        .eq("id", data.event_id)
        .single();

      if (evt) {
        setEvent(evt);

        const { data: cat } = await supabase
          .from("categories")
          .select("name, slug")
          .eq("id", evt.category_id)
          .single();
        if (cat) setCategory(cat);

        const { data: sibs } = await supabase
          .from("photos")
          .select("*")
          .eq("event_id", data.event_id)
          .neq("id", params.id)
          .limit(8);
        if (sibs) setSiblings(sibs);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 animate-pulse">
        <div className="h-4 w-16 rounded bg-bg-elevated" />
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-bg-card">
          <div className="aspect-[16/10] w-full bg-bg-elevated" />
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-bg-elevated" />
              <div className="h-6 w-16 rounded-full bg-bg-elevated" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-16 rounded bg-bg-elevated" />
              <div className="h-11 w-32 rounded-lg bg-bg-elevated" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-2xl tracking-wider text-text-primary">PHOTO NOT FOUND</p>
        <p className="mt-3 max-w-sm text-sm text-text-muted">
          This photo may have been removed after the 60-day archive window.
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            href="/"
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Browse Photos
          </Link>
          <Link
            href="/resend"
            className="rounded-lg border border-border px-6 py-2.5 text-sm text-text-muted hover:text-text-primary"
          >
            Resend My Downloads
          </Link>
        </div>
      </div>
    );
  }

  const inCart = items.some((item) => item.photo.id === photo.id);

  const handleAdd = () => {
    if (isFull) return;
    addItem(photo);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link
        href={category ? `/category/${category.slug}` : "/"}
        className="text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        ← {category ? `Back to ${category.name}` : "Back"}
      </Link>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-bg-card">
        <div
          className="relative aspect-[16/10] w-full cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={photo.image_url_watermarked}
            alt={`${photo.color} ${photo.vehicle_type}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white opacity-70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
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
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: photo.color.toLowerCase() }}
                  />
                  {photo.color}
                </span>
              )}
            </div>
            {event && (
              <p className="mt-2 text-sm text-text-muted">{event.name || "Event"}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="font-display text-3xl text-text-primary">${photo.price}</span>
            <button
              onClick={handleAdd}
              disabled={inCart || isFull}
              className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                inCart || isFull
                  ? "bg-bg-elevated text-text-muted cursor-default"
                  : "bg-accent text-white hover:bg-accent-hover active:scale-95"
              }`}
            >
              {added ? "Added!" : inCart ? "In Cart" : isFull ? "Cart Full (10 max)" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* More from this event */}
      {siblings.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl tracking-wider text-text-secondary">
            MORE FROM THIS EVENT
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/photo/${s.id}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-bg-card"
              >
                <img
                  src={s.thumbnail_url}
                  alt={`${s.color} ${s.vehicle_type}`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            ×
          </button>
          <img
            src={photo.image_url_watermarked}
            alt={`${photo.color} ${photo.vehicle_type}`}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
