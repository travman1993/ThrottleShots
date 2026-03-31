"use client";

import { useState } from "react";
import Link from "next/link";
import { getCategoryBySlug, getEventByCategoryAndDate, getPhotosByEvent } from "@/data/mock";
import { PhotoCard } from "@/components/PhotoCard";
import { FilterBar } from "@/components/FilterBar";

export default function PhotoGridPage({ params }: { params: { slug: string; date: string } }) {
  const category = getCategoryBySlug(params.slug);
  const event = category ? getEventByCategoryAndDate(category.id, params.date) : undefined;
  const photos = event ? getPhotosByEvent(event.id) : [];

  const [filters, setFilters] = useState({ vehicleType: "All", color: "All" });

  const filtered = photos.filter((p) => {
    const matchVehicle = filters.vehicleType === "All" || p.vehicle_type === filters.vehicleType.toLowerCase();
    const matchColor = filters.color === "All" || p.color === filters.color;
    return matchVehicle && matchColor;
  });

  if (!category || !event) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-muted">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/category/${params.slug}`} className="text-sm text-text-muted transition-colors hover:text-text-secondary">
        ← {category.name}
      </Link>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wider text-text-primary sm:text-4xl">
            {event.name.toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{filtered.length} photos</p>
        </div>
      </div>

      <div className="mt-8">
        <FilterBar onFilterChange={setFilters} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-text-muted">No photos match your filters.</p>
      )}
    </div>
  );
}