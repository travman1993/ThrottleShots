"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PhotoCard } from "@/components/PhotoCard";
import { FilterBar } from "@/components/FilterBar";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface EventRow {
  id: string;
  category_id: string;
  date: string;
  name: string;
}

interface Photo {
  id: string;
  event_id: string;
  image_url_watermarked: string;
  thumbnail_url: string;
  vehicle_type: string;
  color: string;
  price: number;
}

interface CalendarProps {
  eventDates: Map<string, EventRow[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  minDate: Date;
}

export function CategoryPageClient({
  params,
}: {
  params: { slug: string };
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(
    searchParams.get("date")
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ vehicleType: "All", color: "All" });

  const handleSelectDate = (date: string) => {
    if (date === selectedDate) {
      setSelectedDate(null);
      setSelectedEventId(null);
      router.replace(`/category/${params.slug}`, { scroll: false });
      return;
    }
    setSelectedDate(date);
    setSelectedEventId(null);
    router.replace(`/category/${params.slug}?date=${date}`, { scroll: false });
  };

  const handleClear = () => {
    setSelectedDate(null);
    setSelectedEventId(null);
    router.replace(`/category/${params.slug}`, { scroll: false });
  };

  const [category, setCategory] = useState<Category | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategory();
  }, [params.slug]);

  useEffect(() => {
    if (selectedEventId) {
      loadPhotos(selectedEventId);
    } else {
      setPhotos([]);
    }
  }, [selectedEventId]);

  const loadCategory = async () => {
    setLoading(true);

    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", params.slug)
      .single();

    if (!cat) {
      setLoading(false);
      return;
    }

    setCategory(cat);

    const { data: evts } = await supabase
      .from("events")
      .select("*")
      .eq("category_id", cat.id)
      .order("date", { ascending: false });

    if (evts) {
      setEvents(evts);

      const eventIds = evts.map((e: EventRow) => e.id);
      if (eventIds.length > 0) {
        const { data: countData } = await supabase
          .from("photos")
          .select("event_id")
          .in("event_id", eventIds);

        if (countData) {
          const map: Record<string, number> = {};
          countData.forEach((row: { event_id: string }) => {
            map[row.event_id] = (map[row.event_id] || 0) + 1;
          });
          setPhotoCounts(map);
        }
      }

      // Auto-select event if URL has a date and only one event on that date
      const urlDate = searchParams.get("date");
      if (urlDate) {
        const onDate = evts.filter((e: EventRow) => e.date === urlDate);
        if (onDate.length === 1) setSelectedEventId(onDate[0].id);
      }
    }

    setLoading(false);
  };

  const loadPhotos = async (eventId: string) => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (data) setPhotos(data);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-4 w-16 rounded bg-bg-elevated" />
        <div className="mt-6 h-10 w-64 rounded bg-bg-elevated" />
        <div className="mt-2 h-4 w-48 rounded bg-bg-elevated" />
        <div className="mt-12 h-6 w-32 rounded bg-bg-elevated" />
        <div className="mt-6 h-72 rounded-xl bg-bg-elevated" />
        <div className="mt-10 h-6 w-32 rounded bg-bg-elevated" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-bg-elevated" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-muted">Category not found.</p>
      </div>
    );
  }

  // Group events by date — multiple events can share a date
  const eventDates = new Map<string, EventRow[]>();
  for (const e of events) {
    const existing = eventDates.get(e.date) ?? [];
    eventDates.set(e.date, [...existing, e]);
  }

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId) ?? null
    : null;

  const eventsOnSelectedDate = selectedDate ? (eventDates.get(selectedDate) ?? []) : [];

  const minDate =
    events.length > 0
      ? new Date(events[events.length - 1].date + "T12:00:00")
      : new Date();

  const filtered = photos.filter((p) => {
    const matchVehicle =
      filters.vehicleType === "All" ||
      p.vehicle_type === filters.vehicleType.toLowerCase();
    const matchColor = filters.color === "All" || p.color === filters.color;
    return matchVehicle && matchColor;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        ← Back
      </Link>

      <h1 className="mt-6 font-display text-4xl tracking-wider text-text-primary sm:text-5xl">
        {category.name.toUpperCase()}
      </h1>
      <p className="mt-2 text-text-secondary">{category.description}</p>

      <h2 className="mt-12 font-display text-xl tracking-wider text-text-secondary">
        SELECT A DATE
      </h2>

      <Calendar
        eventDates={eventDates}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        photoCounts={photoCounts}
        minDate={minDate}
      />

      {/* Multiple events on selected date — show picker */}
      {selectedDate && !selectedEventId && eventsOnSelectedDate.length > 1 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wider text-text-secondary">
              {eventsOnSelectedDate.length} EVENTS ON THIS DATE
            </h2>
            <button onClick={handleClear} className="text-xs text-text-muted transition-colors hover:text-text-secondary">
              Clear selection
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {eventsOnSelectedDate.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className="group flex items-center gap-5 rounded-xl border border-accent/30 bg-bg-card p-5 text-left transition-all hover:border-accent/60 hover:bg-bg-elevated"
              >
                <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-accent/10">
                  <span className="font-display text-2xl text-accent">
                    {new Date(ev.date + "T12:00:00").getDate()}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg tracking-wider text-text-primary">
                    {(ev.name || "Untitled").toUpperCase()}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {photoCounts[ev.id] || 0} photos
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photos view for selected event */}
      {selectedEvent && (
        <div className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              {eventsOnSelectedDate.length > 1 && (
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="mb-2 text-xs text-accent transition-colors hover:text-accent-hover"
                >
                  ← Back to events on this date
                </button>
              )}
              <h2 className="font-display text-2xl tracking-wider text-text-primary">
                {(selectedEvent.name || "Untitled").toUpperCase()}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {filtered.length} photo{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-xs text-text-muted transition-colors hover:text-text-secondary"
            >
              Clear selection
            </button>
          </div>

          <div className="mt-6">
            <FilterBar onFilterChange={setFilters} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-12 text-center text-text-muted">
              No photos match your filters.
            </p>
          )}
        </div>
      )}

      {/* All events list — shown when nothing selected */}
      {!selectedDate && (
        <div className="mt-10">
          <h2 className="font-display text-xl tracking-wider text-text-secondary">
            ALL EVENTS
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {events.map((event) => {
              const dateObj = new Date(event.date + "T12:00:00");
              return (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedDate(event.date);
                    setSelectedEventId(event.id);
                    router.replace(`/category/${params.slug}?date=${event.date}`, { scroll: false });
                  }}
                  className="group flex items-center gap-5 rounded-xl border border-border bg-bg-card p-5 text-left transition-all hover:border-accent/40 hover:bg-bg-elevated"
                >
                  <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-bg-elevated group-hover:bg-accent/10">
                    <span className="text-xs font-medium uppercase text-accent">
                      {dateObj.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="font-display text-2xl text-text-primary">
                      {dateObj.getDate()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg tracking-wider text-text-primary">
                      {(event.name || "Untitled").toUpperCase()}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {photoCounts[event.id] || 0} photos
                    </p>
                  </div>
                </button>
              );
            })}
            {events.length === 0 && (
              <p className="text-text-muted">No events yet for this category.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Calendar({
  eventDates,
  selectedDate,
  onSelectDate,
  photoCounts,
  minDate,
}: CalendarProps & { photoCounts: Record<string, number> }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const oldestMonth = minDate.getMonth();
  const oldestYear = minDate.getFullYear();

  const canGoBack =
    currentYear > oldestYear ||
    (currentYear === oldestYear && currentMonth > oldestMonth);

  const canGoForward =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth < today.getMonth());

  const goBack = () => {
    if (!canGoBack) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goForward = () => {
    if (!canGoForward) return;
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const formatDateStr = (day: number): string => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mt-6 rounded-xl border border-border bg-bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            canGoBack
              ? "bg-bg-elevated text-text-primary hover:bg-bg-hover"
              : "text-text-muted cursor-not-allowed"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h3 className="font-display text-xl tracking-wider text-text-primary">
          {monthName.toUpperCase()}
        </h3>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            canGoForward
              ? "bg-bg-elevated text-text-primary hover:bg-bg-hover"
              : "text-text-muted cursor-not-allowed"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1">
        {dayLabels.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-text-muted">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.map((wk, wi) =>
          wk.map((day, di) => {
            if (day === null) {
              return <div key={`${wi}-${di}`} className="aspect-square" />;
            }

            const dateStr = formatDateStr(day);
            const dateEvents = eventDates.get(dateStr);
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            const isSelected = dateStr === selectedDate;

            if (dateEvents && dateEvents.length > 0) {
              const totalPhotos = dateEvents.reduce((sum, ev) => sum + (photoCounts[ev.id] || 0), 0);
              const multi = dateEvents.length > 1;
              return (
                <button
                  key={`${wi}-${di}`}
                  onClick={() => onSelectDate(dateStr)}
                  className={`group relative flex aspect-square flex-col items-center justify-center rounded-lg transition-all ${
                    isSelected
                      ? "bg-accent text-white border border-accent"
                      : "bg-accent/10 border border-accent/30 hover:bg-accent/20 hover:border-accent/60"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-accent"}`}>
                    {day}
                  </span>
                  {multi ? (
                    <span className={`mt-0.5 text-[9px] font-bold leading-none ${isSelected ? "text-white" : "text-accent"}`}>
                      {dateEvents.length}
                    </span>
                  ) : (
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-accent"}`} />
                  )}
                  <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-bg-elevated border border-border px-3 py-2 text-xs text-text-primary opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10">
                    {multi ? (
                      <>
                        <span className="font-semibold">{dateEvents.length} events</span>
                        <br />
                        <span className="text-text-secondary">{totalPhotos} photos total</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">{dateEvents[0].name || "Event"}</span>
                        <br />
                        <span className="text-text-secondary">{totalPhotos} photos</span>
                      </>
                    )}
                  </div>
                </button>
              );
            }

            return (
              <div
                key={`${wi}-${di}`}
                className={`flex aspect-square items-center justify-center rounded-lg text-sm ${
                  isToday
                    ? "bg-bg-elevated text-text-primary font-semibold ring-1 ring-text-muted"
                    : "text-text-muted"
                }`}
              >
                {day}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-xs text-text-secondary">Has event</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-text-muted" />
          <span className="text-xs text-text-secondary">Today</span>
        </div>
      </div>
    </div>
  );
}
