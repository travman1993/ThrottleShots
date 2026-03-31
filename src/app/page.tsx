import Image from "next/image";
import Link from "next/link";
import { categories, events } from "@/data/mock";

export default function HomePage() {
  const recentEvents = [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/80 to-bg" />
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1400&q=60"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-display text-6xl tracking-wider text-text-primary sm:text-8xl">
            FIND <span className="text-accent">YOUR</span> SHOT
          </h1>
          <p className="mt-4 text-lg text-text-secondary sm:text-xl">
            Event photography for car meets, track days, and everything in between.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl tracking-wider text-text-primary">CATEGORIES</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10"
            >
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display text-lg tracking-wider text-white">{cat.name.toUpperCase()}</h3>
                <p className="mt-1 text-xs text-white/60">{cat.event_count} events</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Shoots */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl tracking-wider text-text-primary">RECENT SHOOTS</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentEvents.map((event) => {
            const cat = categories.find((c) => c.id === event.category_id);
            return (
              <Link
                key={event.id}
                href={`/category/${cat?.slug}/${event.date}`}
                className="group rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-border-hover hover:bg-bg-elevated"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-accent">{cat?.name}</span>
                  <span className="text-xs text-text-muted">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl tracking-wider text-text-primary">{event.name.toUpperCase()}</h3>
                <p className="mt-1 text-sm text-text-secondary">{event.photo_count} photos</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}