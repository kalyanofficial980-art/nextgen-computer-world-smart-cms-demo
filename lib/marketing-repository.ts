import { createPublicClient } from "@/lib/supabase/public";
import type { Offer, Review } from "@/lib/marketing-types";

function isOfferCurrentlyVisible(offer: Offer, now = new Date()) {
  if (!offer.active) return false;

  const startsAt = offer.starts_at ? new Date(offer.starts_at) : null;
  const endsAt = offer.ends_at ? new Date(offer.ends_at) : null;

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;

  return true;
}

export async function getActiveOffers(limit = 24): Promise<Offer[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(Math.max(limit * 2, 24));

  if (error) {
    console.error("Unable to load offers:", error.message);
    return [];
  }

  return ((data ?? []) as Offer[])
    .filter((offer) => isOfferCurrentlyVisible(offer))
    .slice(0, limit);
}

export async function getPublishedReviews(limit = 100): Promise<Review[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Unable to load reviews:", error.message);
    return [];
  }

  return (data ?? []) as Review[];
}
