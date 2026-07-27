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
  updated_at?: string;
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
  updated_at?: string;
};
