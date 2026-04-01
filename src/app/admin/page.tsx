"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface EventRow {
  id: string;
  category_id: string;
  date: string;
  name: string;
}

interface PhotoRow {
  id: string;
  event_id: string;
  thumbnail_url: string;
  vehicle_type: string;
  color: string;
  created_at: string;
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);

  // Event form
  const [eventCategory, setEventCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventMsg, setEventMsg] = useState("");

  // Upload form
  const [selectedEvent, setSelectedEvent] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [photoColor, setPhotoColor] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);

  // Manage photos
  const [manageEvent, setManageEvent] = useState("");
  const [eventPhotos, setEventPhotos] = useState<PhotoRow[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [cleanupMsg, setCleanupMsg] = useState("");

  useEffect(() => {
    loadCategories();
    loadEvents();
  }, []);

  useEffect(() => {
    if (manageEvent) {
      loadEventPhotos(manageEvent);
    } else {
      setEventPhotos([]);
    }
  }, [manageEvent]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });
    if (data) setEvents(data);
  };

  const loadEventPhotos = async (eventId: string) => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    if (data) setEventPhotos(data);
  };

  const createEvent = async () => {
    if (!eventCategory || !eventDate) {
      setEventMsg("Category and date are required.");
      return;
    }

    const { error } = await supabase.from("events").insert({
      category_id: eventCategory,
      date: eventDate,
      name: eventName || null,
    });

    if (error) {
      setEventMsg("Error: " + error.message);
    } else {
      setEventMsg("Event created!");
      setEventCategory("");
      setEventDate("");
      setEventName("");
      loadEvents();
    }
  };

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const newItems = imageFiles.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    setUploadQueue((prev) => [...prev, ...newItems]);
  }, []);

  const removeFromQueue = (index: number) => {
    setUploadQueue((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAll = async () => {
    if (!selectedEvent || uploadQueue.length === 0) return;

    const total = uploadQueue.length;
    setUploading(true);
    setUploadProgress(0);
    setUploadTotal(total);

    for (let i = 0; i < total; i++) {
      const { file } = uploadQueue[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("event_id", selectedEvent);
      formData.append("vehicle_type", vehicleType);
      formData.append("color", photoColor);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!data.photo) {
          console.error("Upload failed:", data.error);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }

      setUploadProgress(i + 1);
    }

    setUploadQueue((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setUploading(false);

    // Refresh photos if viewing the same event
    if (manageEvent === selectedEvent) {
      loadEventPhotos(manageEvent);
    }
  };

  const deletePhoto = async (photoId: string) => {
    setDeleting(photoId);

    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setEventPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } else {
        console.error("Delete failed:", data.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }

    setDeleting(null);
  };

  const runCleanup = async () => {
    setCleanupMsg("Running cleanup...");

    try {
      const res = await fetch("/api/cleanup", { method: "POST" });
      const data = await res.json();
      setCleanupMsg(data.message);
      loadEvents();
      if (manageEvent) loadEventPhotos(manageEvent);
    } catch {
      setCleanupMsg("Cleanup failed.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-wider text-text-primary">
          ADMIN
        </h1>
        <button
          onClick={async () => {
            await fetch("/api/admin-logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="rounded-lg border border-border px-4 py-2 text-xs text-text-muted transition-colors hover:border-red-500 hover:text-red-400"
        >
          Log Out
        </button>
      </div>

      {/* Create Event */}
      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">
          CREATE EVENT
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs text-text-muted">
              Category
            </label>
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            >
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">
              Name (optional)
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Spring Run"
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
        </div>
        <button
          onClick={createEvent}
          className="mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Create Event
        </button>
        {eventMsg && (
          <p className="mt-2 text-sm text-text-secondary">{eventMsg}</p>
        )}
      </section>

      {/* Upload Photos */}
      <section className="mt-16">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">
          UPLOAD PHOTOS
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            >
              <option value="">Select event...</option>
              {events.map((ev) => {
                const cat = categories.find((c) => c.id === ev.category_id);
                return (
                  <option key={ev.id} value={ev.id}>
                    {cat?.name} — {ev.name || ev.date}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">
              Vehicle Type
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            >
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="truck">Truck</option>
              <option value="atv">ATV</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">
              Color (optional)
            </label>
            <select
              value={photoColor}
              onChange={(e) => setPhotoColor(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            >
              <option value="">None</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Silver">Silver</option>
              <option value="Yellow">Yellow</option>
              <option value="Green">Green</option>
              <option value="Orange">Orange</option>
            </select>
          </div>
        </div>

        {/* Drag and Drop */}
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(Array.from(e.dataTransfer.files));
          }}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`mt-6 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
            dragActive
              ? "border-accent bg-accent/5"
              : "border-border bg-bg-card hover:border-border-hover"
          }`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-text-muted"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="mt-3 text-sm text-text-secondary">
            Drag & drop photos here
          </p>
          <p className="mt-1 text-xs text-text-muted">or click to browse</p>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          />
        </div>

        {/* Queue */}
        {uploadQueue.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                {uploadQueue.length} file
                {uploadQueue.length !== 1 ? "s" : ""} ready
              </p>
              <button
                onClick={uploadAll}
                disabled={uploading || !selectedEvent}
                className={`rounded-lg px-6 py-2.5 text-sm font-semibold text-white ${
                  uploading || !selectedEvent
                    ? "bg-bg-elevated text-text-muted cursor-not-allowed"
                    : "bg-accent hover:bg-accent-hover"
                }`}
              >
                {uploading
                  ? `Uploading ${uploadProgress}/${uploadTotal}...`
                  : "Upload All"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {uploadQueue.map((item, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-bg-elevated"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(i);
                    }}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{
                  width: `${uploadTotal > 0 ? (uploadProgress / uploadTotal) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Manage Photos */}
      <section className="mt-16">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">
          MANAGE PHOTOS
        </h2>

        <div className="mt-6">
          <label className="mb-2 block text-xs text-text-muted">
            Select event to manage
          </label>
          <select
            value={manageEvent}
            onChange={(e) => setManageEvent(e.target.value)}
            className="w-full max-w-md rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
          >
            <option value="">Select event...</option>
            {events.map((ev) => {
              const cat = categories.find((c) => c.id === ev.category_id);
              return (
                <option key={ev.id} value={ev.id}>
                  {cat?.name} — {ev.name || ev.date}
                </option>
              );
            })}
          </select>
        </div>

        {eventPhotos.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-text-secondary">
              {eventPhotos.length} photo{eventPhotos.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {eventPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={photo.thumbnail_url}
                    alt={photo.vehicle_type}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      disabled={deleting === photo.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      {deleting === photo.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-[10px] text-text-secondary capitalize">
                      {photo.color ? `${photo.color} ` : ""}
                      {photo.vehicle_type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {manageEvent && eventPhotos.length === 0 && (
          <p className="mt-6 text-text-muted">No photos for this event.</p>
        )}
      </section>

      {/* Cleanup */}
      <section className="mt-16 mb-20 rounded-xl border border-border bg-bg-card p-6">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">
          CLEANUP
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Delete all photos and empty events older than 60 days to free up
          storage.
        </p>
        <button
          onClick={runCleanup}
          className="mt-4 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Run 60-Day Cleanup
        </button>
        {cleanupMsg && (
          <p className="mt-2 text-sm text-text-secondary">{cleanupMsg}</p>
        )}
      </section>
    </div>
  );
}