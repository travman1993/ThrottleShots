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

  // Stats
  const [totalPhotos, setTotalPhotos] = useState<number>(0);

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

  // Upload results
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadDone, setUploadDone] = useState(false);

  // Manage photos
  const [manageEvent, setManageEvent] = useState("");
  const [eventPhotos, setEventPhotos] = useState<PhotoRow[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [cleanupMsg, setCleanupMsg] = useState("");

  // Edit event
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventName, setEditEventName] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventCategory, setEditEventCategory] = useState("");
  const [editEventMsg, setEditEventMsg] = useState("");
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);

  // Edit photo
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [editPhotoVehicle, setEditPhotoVehicle] = useState("car");
  const [editPhotoColor, setEditPhotoColor] = useState("");

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Bulk delete
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
    loadEvents();
    loadStats();
  }, []);

  useEffect(() => {
    setEditingEventId(null);
    setEditEventMsg("");
    setConfirmDeleteEvent(false);
    setBulkMode(false);
    setSelectedPhotos(new Set());
    setConfirmDelete(null);
    setEditingPhoto(null);
    if (manageEvent) {
      loadEventPhotos(manageEvent);
    } else {
      setEventPhotos([]);
    }
  }, [manageEvent]);

  const loadStats = async () => {
    const { count } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true });
    setTotalPhotos(count ?? 0);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
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
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: eventCategory, date: eventDate, name: eventName || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEventMsg("Error: " + data.error);
    } else {
      setEventMsg("Event created!");
      setEventCategory("");
      setEventDate("");
      setEventName("");
      loadEvents();
    }
  };

  const deleteEvent = async () => {
    if (!manageEvent) return;
    setDeletingEvent(true);
    try {
      const res = await fetch(`/api/events/${manageEvent}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setManageEvent("");
        loadEvents();
        loadStats();
      }
    } catch (err) {
      console.error("Delete event error:", err);
    }
    setDeletingEvent(false);
    setConfirmDeleteEvent(false);
  };

  const startEditEvent = (ev: EventRow) => {
    setEditingEventId(ev.id);
    setEditEventName(ev.name || "");
    setEditEventDate(ev.date);
    setEditEventCategory(ev.category_id);
    setEditEventMsg("");
  };

  const saveEvent = async () => {
    if (!editingEventId) return;
    const res = await fetch(`/api/events/${editingEventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editEventName || null, date: editEventDate, category_id: editEventCategory }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEditEventMsg("Error: " + data.error);
    } else {
      setEditEventMsg("Saved!");
      loadEvents();
      setTimeout(() => { setEditingEventId(null); setEditEventMsg(""); }, 1500);
    }
  };

  const startEditPhoto = (photo: PhotoRow) => {
    setEditingPhoto(photo.id);
    setEditPhotoVehicle(photo.vehicle_type);
    setEditPhotoColor(photo.color || "");
    setConfirmDelete(null);
  };

  const savePhoto = async () => {
    if (!editingPhoto) return;
    const res = await fetch(`/api/photos/${editingPhoto}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicle_type: editPhotoVehicle, color: editPhotoColor }),
    });
    const data = await res.json();
    if (data.photo) {
      setEventPhotos((prev) =>
        prev.map((p) =>
          p.id === editingPhoto
            ? { ...p, vehicle_type: editPhotoVehicle, color: editPhotoColor }
            : p
        )
      );
      setEditingPhoto(null);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (selectedPhotos.size === 0) return;
    setBulkDeleting(true);
    for (const photoId of Array.from(selectedPhotos)) {
      await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      setEventPhotos((prev) => prev.filter((p) => p.id !== photoId));
    }
    setSelectedPhotos(new Set());
    setBulkMode(false);
    setBulkDeleting(false);
    loadStats();
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
    setUploadErrors([]);
    setUploadDone(false);

    const errors: string[] = [];

    for (let i = 0; i < uploadQueue.length; i++) {
      const { file } = uploadQueue[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("event_id", selectedEvent);
      formData.append("vehicle_type", vehicleType);
      formData.append("color", photoColor);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!data.photo) errors.push(file.name);
      } catch {
        errors.push(file.name);
      }
      setUploadProgress(i + 1);
    }

    setUploadQueue((prev) => { prev.forEach((item) => URL.revokeObjectURL(item.previewUrl)); return []; });
    setUploading(false);
    setUploadErrors(errors);
    setUploadDone(true);
    loadStats();
    if (manageEvent === selectedEvent) loadEventPhotos(manageEvent);
  };

  const deletePhoto = async (photoId: string) => {
    setDeleting(photoId);
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setEventPhotos((prev) => prev.filter((p) => p.id !== photoId));
        loadStats();
      } else {
        console.error("Delete failed:", data.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
    setDeleting(null);
    setConfirmDelete(null);
  };

  const runCleanup = async () => {
    setCleanupMsg("Running cleanup...");
    try {
      const res = await fetch("/api/cleanup", { method: "POST" });
      const data = await res.json();
      setCleanupMsg(data.message);
      loadEvents();
      loadStats();
      if (manageEvent) loadEventPhotos(manageEvent);
    } catch {
      setCleanupMsg("Cleanup failed.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-wider text-text-primary">ADMIN</h1>
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

      {/* Stats */}
      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <p className="text-xs tracking-wider text-text-muted">EVENTS</p>
          <p className="mt-2 font-display text-4xl text-text-primary">{events.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <p className="text-xs tracking-wider text-text-muted">PHOTOS</p>
          <p className="mt-2 font-display text-4xl text-text-primary">{totalPhotos}</p>
        </div>
        {categories.map((cat) => {
          const count = events.filter((e) => e.category_id === cat.id).length;
          if (count === 0) return null;
          return (
            <div key={cat.id} className="rounded-xl border border-border bg-bg-card p-5">
              <p className="text-xs tracking-wider text-text-muted uppercase">{cat.name}</p>
              <p className="mt-2 font-display text-4xl text-text-primary">{count}</p>
              <p className="text-xs text-text-muted">events</p>
            </div>
          );
        })}
      </section>

      {/* Create Event */}
      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">CREATE EVENT</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Category</label>
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            >
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
            <label className="mb-2 block text-xs text-text-muted">Name (optional)</label>
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
        {eventMsg && <p className="mt-2 text-sm text-text-secondary">{eventMsg}</p>}
      </section>

      {/* Upload Photos */}
      <section className="mt-16">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">UPLOAD PHOTOS</h2>
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
            <label className="mb-2 block text-xs text-text-muted">Vehicle Type</label>
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
            <label className="mb-2 block text-xs text-text-muted">Color (optional)</label>
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

        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(Array.from(e.dataTransfer.files)); }}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`mt-6 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
            dragActive ? "border-accent bg-accent/5" : "border-border bg-bg-card hover:border-border-hover"
          }`}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="mt-3 text-sm text-text-secondary">Drag & drop photos here</p>
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

        {uploadQueue.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                {uploadQueue.length} file{uploadQueue.length !== 1 ? "s" : ""} ready
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
                {uploading ? `Uploading ${uploadProgress}/${uploadTotal}...` : "Upload All"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {uploadQueue.map((item, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-bg-elevated">
                  <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}
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
                style={{ width: `${uploadTotal > 0 ? (uploadProgress / uploadTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {uploadDone && !uploading && (
          <div className="mt-4">
            {uploadErrors.length === 0 ? (
              <p className="text-sm text-accent">
                All {uploadTotal} photo{uploadTotal !== 1 ? "s" : ""} uploaded successfully.
              </p>
            ) : (
              <div>
                <p className="text-sm text-text-secondary">
                  {uploadTotal - uploadErrors.length}/{uploadTotal} uploaded.{" "}
                  <span className="text-red-400">{uploadErrors.length} failed:</span>
                </p>
                <ul className="mt-1 space-y-0.5">
                  {uploadErrors.map((name) => (
                    <li key={name} className="text-xs text-red-400">{name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Manage Photos */}
      <section className="mt-16">
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">MANAGE PHOTOS</h2>

        <div className="mt-6">
          <label className="mb-2 block text-xs text-text-muted">Select event to manage</label>
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

        {/* Edit Event */}
        {manageEvent && (
          <div className="mt-4">
            {editingEventId === manageEvent ? (
              <div className="rounded-xl border border-border bg-bg-card p-4">
                <p className="mb-4 text-xs tracking-wider text-text-muted">EDIT EVENT</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Category</label>
                    <select
                      value={editEventCategory}
                      onChange={(e) => setEditEventCategory(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Date</label>
                    <input
                      type="date"
                      value={editEventDate}
                      onChange={(e) => setEditEventDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Name</label>
                    <input
                      type="text"
                      value={editEventName}
                      onChange={(e) => setEditEventName(e.target.value)}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={saveEvent}
                    className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingEventId(null); setEditEventMsg(""); }}
                    className="rounded-lg border border-border px-4 py-2 text-xs text-text-muted hover:text-text-secondary"
                  >
                    Cancel
                  </button>
                  {editEventMsg && <p className="text-xs text-text-secondary">{editEventMsg}</p>}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const ev = events.find((e) => e.id === manageEvent);
                    if (ev) startEditEvent(ev);
                  }}
                  className="text-xs text-text-muted transition-colors hover:text-accent"
                >
                  Edit event details →
                </button>
                {confirmDeleteEvent ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Delete this event and all its photos?</span>
                    <button
                      onClick={deleteEvent}
                      disabled={deletingEvent}
                      className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingEvent ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteEvent(false)}
                      className="rounded border border-border px-3 py-1 text-xs text-text-muted hover:text-text-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteEvent(true)}
                    className="text-xs text-text-muted transition-colors hover:text-red-400"
                  >
                    Delete event →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {eventPhotos.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                {eventPhotos.length} photo{eventPhotos.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                {bulkMode ? (
                  <>
                    {selectedPhotos.size > 0 && (
                      <button
                        onClick={deleteSelected}
                        disabled={bulkDeleting}
                        className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {bulkDeleting ? "Deleting..." : `Delete ${selectedPhotos.size} selected`}
                      </button>
                    )}
                    <button
                      onClick={() => { setBulkMode(false); setSelectedPhotos(new Set()); }}
                      className="rounded-lg border border-border px-4 py-1.5 text-xs text-text-muted hover:text-text-secondary"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setBulkMode(true)}
                    className="rounded-lg border border-border px-4 py-1.5 text-xs text-text-muted hover:text-text-secondary"
                  >
                    Select
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {eventPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <img src={photo.thumbnail_url} alt={photo.vehicle_type} className="h-full w-full object-cover" />

                  {/* Bulk select overlay */}
                  {bulkMode && (
                    <div
                      className={`absolute inset-0 cursor-pointer transition-colors ${
                        selectedPhotos.has(photo.id) ? "bg-accent/30" : "bg-black/20 hover:bg-black/30"
                      }`}
                      onClick={() => togglePhotoSelection(photo.id)}
                    >
                      <div className={`absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded border-2 ${
                        selectedPhotos.has(photo.id) ? "border-accent bg-accent" : "border-white bg-black/40"
                      }`}>
                        {selectedPhotos.has(photo.id) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Normal mode overlay */}
                  {!bulkMode && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/70 transition-opacity ${
                      confirmDelete === photo.id || editingPhoto === photo.id
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}>
                      {editingPhoto === photo.id ? (
                        <div className="w-full px-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={editPhotoVehicle}
                            onChange={(e) => setEditPhotoVehicle(e.target.value)}
                            className="mb-1 w-full rounded border border-border bg-black/80 px-2 py-1 text-xs text-text-primary outline-none"
                          >
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="truck">Truck</option>
                            <option value="atv">ATV</option>
                          </select>
                          <select
                            value={editPhotoColor}
                            onChange={(e) => setEditPhotoColor(e.target.value)}
                            className="mb-1 w-full rounded border border-border bg-black/80 px-2 py-1 text-xs text-text-primary outline-none"
                          >
                            <option value="">No color</option>
                            <option value="Red">Red</option>
                            <option value="Blue">Blue</option>
                            <option value="Black">Black</option>
                            <option value="White">White</option>
                            <option value="Silver">Silver</option>
                            <option value="Yellow">Yellow</option>
                            <option value="Green">Green</option>
                            <option value="Orange">Orange</option>
                          </select>
                          <div className="flex gap-1">
                            <button onClick={savePhoto} className="flex-1 rounded bg-accent py-1 text-xs text-white hover:bg-accent-hover">
                              Save
                            </button>
                            <button onClick={() => setEditingPhoto(null)} className="flex-1 rounded border border-border py-1 text-xs text-text-muted hover:text-white">
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : confirmDelete === photo.id ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <p className="text-xs font-medium text-white">Delete?</p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => deletePhoto(photo.id)}
                              disabled={deleting === photo.id}
                              className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              {deleting === photo.id ? "..." : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="rounded border border-border px-3 py-1 text-xs text-white hover:bg-white/10"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditPhoto(photo)}
                            className="rounded-lg bg-bg-elevated px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-hover"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(photo.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-[10px] text-text-secondary capitalize">
                      {photo.color ? `${photo.color} ` : ""}{photo.vehicle_type}
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
        <h2 className="font-display text-2xl tracking-wider text-text-secondary">CLEANUP</h2>
        <p className="mt-2 text-sm text-text-muted">
          Delete all photos and empty events older than 60 days to free up storage.
        </p>
        <button
          onClick={runCleanup}
          className="mt-4 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Run 60-Day Cleanup
        </button>
        {cleanupMsg && <p className="mt-2 text-sm text-text-secondary">{cleanupMsg}</p>}
      </section>
    </div>
  );
}
