export type BusinessSettings = {
  id: number;
  business_name: string;
  short_name: string;
  tagline: string;
  description: string;
  phone_display: string;
  phone_link: string;
  whatsapp_number: string;
  contact_email: string;
  owner_email: string;
  address_line: string;
  map_url: string;
  working_hours: string;
  gst_number: string;
  registration_number: string;
  service_areas: string[];
  logo_url: string;
  logo_dark_url: string;
  favicon_url: string;
  hero_image_url: string;
  hero_badge: string;
  hero_title: string;
  hero_description: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  panel_color: string;
  text_color: string;
  announcement_active: boolean;
  announcement_text: string;
  announcement_link: string;
  youtube_url: string;
  instagram_url: string;
  facebook_url: string;
  google_business_url: string;
  google_analytics_id: string;
  meta_pixel_id: string;
  search_console_verification: string;
  show_public_sales_stats: boolean;
  show_recent_sales: boolean;
  updated_at?: string;
};

export type HomepageSection = {
  section_key: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  sort_order: number;
};

export type Offer = {
  id: string;
  title: string;
  slug: string;
  description: string;
  discount_label: string;
  coupon_code: string;
  image_url: string;
  button_label: string;
  button_link: string;
  starts_at: string | null;
  ends_at: string | null;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at?: string;
};

export type Review = {
  id: string;
  customer_name: string;
  customer_city: string;
  rating: number;
  review_text: string;
  product_or_service: string;
  image_url: string;
  verified_customer: boolean;
  featured: boolean;
  published: boolean;
  sort_order: number;
  review_date: string;
  created_at?: string;
};

export type MediaProvider = "youtube" | "instagram" | "facebook" | "uploaded";

export type MediaItem = {
  id: string;
  title: string;
  description: string;
  provider: MediaProvider;
  media_url: string;
  thumbnail_url: string;
  show_on_homepage: boolean;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at?: string;
};

export type Customer = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  notes: string;
  marketing_consent: boolean;
  created_at?: string;
};

export type Sale = {
  id: string;
  product_id: string | null;
  customer_id: string | null;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  cost_amount: number | null;
  payment_status: "Pending" | "Part Paid" | "Paid" | "Refunded" | "Cancelled";
  payment_method: string;
  invoice_reference: string;
  warranty_until: string | null;
  customer_city: string;
  public_note: string;
  private_note: string;
  sold_at: string;
  created_at?: string;
};

export type LegalPage = {
  page_key: "privacy" | "terms" | "refund" | "warranty" | "delivery";
  title: string;
  content: string;
  published: boolean;
  updated_at?: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  sort_order: number;
};

export type PublicBusinessStats = {
  total_products: number;
  total_units_sold: number;
  total_reviews: number;
  average_rating: number;
};

export type PublicSale = {
  product_name: string;
  customer_city: string;
  quantity: number;
  sold_at: string;
  public_note: string;
};

export type ActivityLog = {
  id: number;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
};
