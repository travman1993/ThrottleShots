import { Suspense } from "react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { CategoryPageClient } from "./CategoryPageClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { data: cat } = await supabase
    .from("categories")
    .select("name, description, image_url")
    .eq("slug", params.slug)
    .single();

  if (!cat) {
    return { title: "ThrottleShots" };
  }

  const title = `${cat.name} Photos — ThrottleShots`;
  const description =
    cat.description ||
    `Browse and purchase ${cat.name} event photos on ThrottleShots.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(cat.image_url ? { images: [{ url: cat.image_url }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <Suspense>
      <CategoryPageClient params={params} />
    </Suspense>
  );
}
