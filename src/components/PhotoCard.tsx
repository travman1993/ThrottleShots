"use client";

import Link from "next/link";

interface Photo {
  id: string;
  image_url_watermarked: string;
  thumbnail_url: string;
  vehicle_type: string;
  color: string;
  price: number;
}

export function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <Link
      href={`/photo/${photo.id}`}
      className="group block overflow-hidden rounded-lg bg-bg-card border border-border transition-all hover:border-border-hover hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={photo.thumbnail_url}
          alt={`${photo.color} ${photo.vehicle_type}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-bg/80 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-text-primary capitalize">
            {photo.vehicle_type}
          </span>
          <span className="rounded-full bg-accent/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
            ${photo.price}
          </span>
        </div>
      </div>
      {photo.color && (
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full border border-white/20"
              style={{ backgroundColor: photo.color.toLowerCase() }}
            />
            <span className="text-xs text-text-secondary">{photo.color}</span>
          </div>
        </div>
      )}
    </Link>
  );
}