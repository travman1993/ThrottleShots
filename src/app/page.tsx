import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { NotifyForm } from "@/components/NotifyForm";
import { RecentPhotosCarousel } from "@/components/RecentPhotosCarousel";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
}

interface RecentPhoto {
  id: string;
  thumbnail_url: string;
  categorySlug: string;
}

const categoryImages: Record<string, string> = {
  "tail-of-the-dragon":
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  "car-meets":
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  "bike-nights":
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
  "track-days":
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
  "street-shots":
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  "sports":
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
  "portraits":
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
  "concerts":
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  "events":
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  "commercial":
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const revalidate = 300; // re-randomize every 5 minutes

export default async function HomePage() {
  const { data: cats } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const categories: Category[] = cats ?? [];

  // Fetch all events — used for category photo counts AND carousel slug lookup
  const { data: allEventsData } = await supabase
    .from("events")
    .select("id, category_id");

  const allEvts = allEventsData ?? [];
  const allEventIds = allEvts.map((e: { id: string }) => e.id);

  // Build event_id → category_id map
  const eventCatMap: Record<string, string> = {};
  allEvts.forEach((e: { id: string; category_id: string }) => {
    eventCatMap[e.id] = e.category_id;
  });

  // Build category_id → slug map
  const catSlugMap: Record<string, string> = {};
  categories.forEach((c) => { catSlugMap[c.id] = c.slug; });

  // Count photos per category
  const categoryPhotoCounts: Record<string, number> = {};

  // Fetch recent photos (last 7 days) — simple query, no nested join
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: rawPhotos } = await supabase
    .from("photos")
    .select("id, thumbnail_url, event_id")
    .gte("created_at", sevenDaysAgo.toISOString())
    .limit(60);

  // Also count all photos per category
  if (allEventIds.length > 0) {
    const { data: photoData } = await supabase
      .from("photos")
      .select("event_id")
      .in("event_id", allEventIds);

    (photoData ?? []).forEach((p: { event_id: string }) => {
      const catId = eventCatMap[p.event_id];
      if (catId) categoryPhotoCounts[catId] = (categoryPhotoCounts[catId] || 0) + 1;
    });
  }

  const recentPhotos: RecentPhoto[] = shuffle(
    (rawPhotos ?? [])
      .map((p: { id: string; thumbnail_url: string; event_id: string }) => {
        const catId = eventCatMap[p.event_id];
        const slug = catId ? catSlugMap[catId] : "";
        return { id: p.id, thumbnail_url: p.thumbnail_url, categorySlug: slug ?? "" };
      })
      .filter((p) => p.categorySlug)
  ).slice(0, 15);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/80 to-bg" />
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1400&q=60"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-display text-6xl tracking-wider text-text-primary sm:text-8xl">
            FIND <span className="text-accent">YOUR</span> SHOT
          </h1>
          <p className="mt-4 text-lg text-text-secondary sm:text-xl">
            Event photography for car meets, track days, and everything in
            between.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl tracking-wider text-text-primary">
          CATEGORIES
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10"
            >
              <img
                src={
                  cat.image_url || categoryImages[cat.slug] || categoryImages["car-meets"]
                }
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display text-lg tracking-wider text-white">
                  {cat.name.toUpperCase()}
                </h3>
                {(categoryPhotoCounts[cat.id] ?? 0) > 0 && (
                  <p className="mt-0.5 text-xs text-white/60">
                    {categoryPhotoCounts[cat.id]} photos
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Shots carousel */}
      {recentPhotos.length > 0 && (
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl tracking-wider text-text-primary">
              RECENT SHOTS
            </h2>
            <p className="mt-2 text-sm text-text-muted">From the last 7 days</p>
          </div>
          <div className="mt-8">
            <RecentPhotosCarousel photos={recentPhotos} />
          </div>
        </section>
      )}

      {/* Book a Shoot CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-bg-card">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&q=60"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10 px-8 py-12 sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-3xl tracking-wider text-text-primary sm:text-4xl">
                WANT YOUR OWN SHOOT?
              </h2>
              <p className="mt-2 max-w-md text-text-secondary">
                Private sessions, dedicated event coverage, track days, and
                more. Let&apos;s make it happen.
              </p>
            </div>
            <Link
              href="/book"
              className="mt-6 inline-block flex-shrink-0 rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover sm:mt-0 sm:ml-8"
            >
              Book a Session →
            </Link>
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-bg-card px-8 py-10 text-center">
          <h2 className="font-display text-2xl tracking-wider text-text-primary sm:text-3xl">
            NEVER MISS A NEW SHOOT
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
            Drop your email and we&apos;ll notify you when new event photos are
            posted.
          </p>
          <div className="mx-auto mt-6 max-w-sm">
            <NotifyForm />
          </div>
        </div>
      </section>
    </div>
  );
}
