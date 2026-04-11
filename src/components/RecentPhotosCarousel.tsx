"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

interface Photo {
  id: string;
  thumbnail_url: string;
  categorySlug: string;
}

export function RecentPhotosCarousel({ photos }: { photos: Photo[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("a") as HTMLElement | null;
    const cardW = card ? card.offsetWidth + 12 : 252;
    el.scrollBy({ left: dir * cardW * 2, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      if (isHovered.current) return;
      const el = scrollRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const card = el.querySelector("a") as HTMLElement | null;
        const cardW = card ? card.offsetWidth + 12 : 252;
        el.scrollBy({ left: cardW, behavior: "smooth" });
      }
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-bg to-transparent" />

      {/* Prev button */}
      <button
        onClick={() => scroll(-1)}
        className={`absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80 ${
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={() => scroll(1)}
        className={`absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80 ${
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Track */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/category/${photo.categorySlug}`}
            className="group relative flex-none w-[200px] sm:w-[240px] snap-center overflow-hidden rounded-xl bg-bg-elevated"
            style={{ height: "300px" }}
          >
            <img
              src={photo.thumbnail_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}
