export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    event_count: number;
  }
  
  export interface Event {
    id: string;
    category_id: string;
    date: string;
    name: string;
    photo_count: number;
  }
  
  export interface Photo {
    id: string;
    event_id: string;
    image_url_watermarked: string;
    thumbnail_url: string;
    vehicle_type: "car" | "motorcycle" | "truck" | "atv";
    color: string;
    price: number;
  }
  
  export interface CartItem {
    photo: Photo;
    quantity: number;
  }
  
  export const categories: Category[] = [
    {
      id: "1",
      name: "Tail of the Dragon",
      slug: "tail-of-the-dragon",
      description: "318 curves in 11 miles of pure driving bliss",
      image_url:
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
      event_count: 12,
    },
    {
      id: "2",
      name: "Car Meets",
      slug: "car-meets",
      description: "Local and regional car meet photography",
      image_url:
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
      event_count: 24,
    },
    {
      id: "3",
      name: "Bike Nights",
      slug: "bike-nights",
      description: "Two wheels, one perfect shot",
      image_url:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
      event_count: 8,
    },
    {
      id: "4",
      name: "Track Days",
      slug: "track-days",
      description: "High-speed action on the circuit",
      image_url:
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      event_count: 6,
    },
    {
      id: "5",
      name: "Street Shots",
      slug: "street-shots",
      description: "Spotted in the wild",
      image_url:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      event_count: 18,
    },
  ];
  
  export const events: Event[] = [
    { id: "e1", category_id: "1", date: "2026-03-28", name: "Spring Run", photo_count: 142 },
    { id: "e2", category_id: "1", date: "2026-03-21", name: "Weekend Warriors", photo_count: 98 },
    { id: "e3", category_id: "1", date: "2026-03-14", name: "Dragon Slayers", photo_count: 210 },
    { id: "e4", category_id: "2", date: "2026-03-29", name: "Cars & Coffee ATL", photo_count: 76 },
    { id: "e5", category_id: "2", date: "2026-03-22", name: "Import Alliance", photo_count: 320 },
    { id: "e6", category_id: "3", date: "2026-03-27", name: "Friday Night Rides", photo_count: 54 },
    { id: "e7", category_id: "4", date: "2026-03-25", name: "Road Atlanta HPDE", photo_count: 188 },
    { id: "e8", category_id: "5", date: "2026-03-30", name: "Downtown Cruisers", photo_count: 45 },
  ];
  
  const unsplashCars = [
    "https://images.unsplash.com/photo-1525609004556-c46c90e6ffe0?w=600&q=75",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&q=75",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=75",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=75",
    "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=600&q=75",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=75",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=75",
    "https://images.unsplash.com/photo-1535732820275-9ffd998cac22?w=600&q=75",
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=75",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=75",
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=75",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=75",
  ];
  
  const vehicleTypes: Photo["vehicle_type"][] = [
    "car","car","car","motorcycle","car","truck","car","motorcycle","car","car","atv","car",
  ];
  
  const colors = [
    "Red","Blue","Black","White","Silver","Yellow","Green","Orange","Black","White","Red","Blue",
  ];
  
  export const photos: Photo[] = unsplashCars.map((url, i) => ({
    id: `p${i + 1}`,
    event_id: "e1",
    image_url_watermarked: url,
    thumbnail_url: url.replace("w=600", "w=400"),
    vehicle_type: vehicleTypes[i],
    color: colors[i],
    price: 9.99,
  }));
  
  export const allPhotos: Photo[] = [
    ...photos,
    ...photos.slice(0, 8).map((p, i) => ({ ...p, id: `p${13 + i}`, event_id: "e4" })),
    ...photos.slice(0, 6).map((p, i) => ({ ...p, id: `p${21 + i}`, event_id: "e5" })),
  ];
  
  export function getPhotosByEvent(eventId: string): Photo[] {
    return allPhotos.filter((p) => p.event_id === eventId);
  }
  
  export function getEventsByCategory(categoryId: string): Event[] {
    return events.filter((e) => e.category_id === categoryId);
  }
  
  export function getCategoryBySlug(slug: string): Category | undefined {
    return categories.find((c) => c.slug === slug);
  }
  
  export function getEventByCategoryAndDate(categoryId: string, date: string): Event | undefined {
    return events.find((e) => e.category_id === categoryId && e.date === date);
  }
  
  export function getPhotoById(id: string): Photo | undefined {
    return allPhotos.find((p) => p.id === id);
  }

  export const PRICING = {
    single: 9.99,
    bundle3: 19.99,
    bundle5: 29.99,
  };
  
  export function calculateCartTotal(itemCount: number): number {
    if (itemCount === 0) return 0;
  
    let remaining = itemCount;
    let total = 0;
  
    const fivePacks = Math.floor(remaining / 5);
    total += fivePacks * PRICING.bundle5;
    remaining -= fivePacks * 5;
  
    const threePacks = Math.floor(remaining / 3);
    total += threePacks * PRICING.bundle3;
    remaining -= threePacks * 3;
  
    total += remaining * PRICING.single;
  
    return Math.round(total * 100) / 100;
  }