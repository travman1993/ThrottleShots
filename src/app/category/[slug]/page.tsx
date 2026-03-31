"use client";

import Link from "next/link";
import { useState } from "react";
import { getCategoryBySlug, getEventsByCategory } from "@/data/mock";
import { notFound } from "next/navigation";

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const categoryEvents = getEventsByCategory(category.id);
  const eventDates = new Map(
    categoryEvents.map((e) => [e.date, e])
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
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
        categorySlug={params.slug}
      />

      {/* Event list below calendar */}
      <div className="mt-10">
        <h2 className="font-display text-xl tracking-wider text-text-secondary">
          ALL EVENTS
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {categoryEvents
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((event) => {
              const dateObj = new Date(event.date + "T12:00:00");
              return (
                <Link
                  key={event.id}
                  href={`/category/${params.slug}/${event.date}`}
                  className="group flex items-center gap-5 rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-accent/40 hover:bg-bg-elevated"
                >
                  <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-bg-elevated group-hover:bg-accent/10">
                    <span className="text-xs font-medium uppercase text-accent">
                      {dateObj.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                    <span className="font-display text-2xl text-text-primary">
                      {dateObj.getDate()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg tracking-wider text-text-primary">
                      {event.name.toUpperCase()}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {event.photo_count} photos
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function Calendar({
  eventDates,
  categorySlug,
}: {
  eventDates: Map<string, { id: string; date: string; name: string; photo_count: number }>;
  categorySlug: string;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Calculate the oldest allowed month (60 days back)
  const oldestDate = new Date(today);
  oldestDate.setDate(oldestDate.getDate() - 60);
  const oldestMonth = oldestDate.getMonth();
  const oldestYear = oldestDate.getFullYear();

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

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];

  // Pad the first week
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

  // Pad the last week
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const formatDateStr = (day: number) => {
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
      {/* Month nav */}
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="mt-6 grid grid-cols-7 gap-1">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-text-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((wk, wi) =>
          wk.map((day, di) => {
            if (day === null) {
              return <div key={`${wi}-${di}`} className="aspect-square" />;
            }

            const dateStr = formatDateStr(day);
            const event = eventDates.get(dateStr);
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            if (event) {
              return (
                <Link
                  key={`${wi}-${di}`}
                  href={`/category/${categorySlug}/${dateStr}`}
                  className="group relative flex aspect-square flex-col items-center justify-center rounded-lg bg-accent/10 border border-accent/30 transition-all hover:bg-accent/20 hover:border-accent/60"
                >
                  <span className="text-sm font-semibold text-accent">
                    {day}
                  </span>
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-bg-elevated border border-border px-3 py-2 text-xs text-text-primary opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10">
                    <span className="font-semibold">{event.name}</span>
                    <br />
                    <span className="text-text-secondary">
                      {event.photo_count} photos
                    </span>
                  </div>
                </Link>
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

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-xs text-text-secondary">Has photos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-text-muted" />
          <span className="text-xs text-text-secondary">Today</span>
        </div>
      </div>
    </div>
  );
}