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
}

export default function PhotoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, items, isFull } = useCart();
  const [added, setAdded] = useState(false);
  

  useEffect(() => {
    loadPhoto();
  }, [params.id]);

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
        .select("id, name")
        .eq("id", data.event_id)
        .single();

      if (evt) setEvent(evt);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-muted">Photo not found.</p>
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
        href="/"
        className="text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        ← Back
      </Link>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-bg-card">
        <div className="relative aspect-[16/10] w-full">
          <img
            src={photo.image_url_watermarked}
            alt={`${photo.color} ${photo.vehicle_type}`}
            className="h-full w-full object-cover"
          />
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
                    style={{
                      backgroundColor: photo.color.toLowerCase(),
                    }}
                  />
                  {photo.color}
                </span>
              )}
            </div>
            {event && (
              <p className="mt-2 text-sm text-text-muted">
                {event.name || "Event"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="font-display text-3xl text-text-primary">
              ${photo.price}
            </span>
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
    </div>
  );
}