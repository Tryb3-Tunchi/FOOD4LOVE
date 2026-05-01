export type UserRole = "cook" | "buyer" | "admin";
export type LikeStatus = "pending" | "accepted" | "rejected";
export type SwipeDirection = "like" | "pass";
export type ServiceStatus = "pending" | "confirmed" | "preparing" | "completed" | "cancelled";

export type Profile = {
  id: string;
  role: UserRole;
  name: string;
  nickname: string | null;
  looking_for: string | null;
  age: number | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  cuisines: string[] | null;
  interests: string[] | null;
  favorite_foods: string[] | null;
  photos: string[] | null;
  specialty: string | null;
  price_min: number | null;
  price_max: number | null;
  is_bot: boolean;
  bot_persona: string | null;
  is_admin: boolean;
  onboarding_completed: boolean;
  kyc_status: string;
  kyc_full_name: string | null;
  kyc_country: string | null;
  kyc_selfie: string | null;
  kyc_id_doc: string | null;
  lat: number | null;
  lng: number | null;
  available_for_parties?: boolean;
  last_seen_at?: string | null;
  referral_code?: string | null;
  daily_special?: string | null;
  daily_special_until?: string | null;
  created_at: string;
  updated_at: string;
};

export type Dish = {
  id: string;
  cook_id: string;
  name: string;
  image_url: string | null;
  created_at: string;
};

export type Like = {
  id: string;
  buyer_id: string;
  cook_id: string;
  status: LikeStatus;
  created_at: string;
};

export type Swipe = {
  id: string;
  swiper_id: string;
  target_id: string;
  direction: SwipeDirection;
  created_at: string;
};

export type Match = {
  id: string;
  buyer_id: string;
  cook_id: string;
  expires_at: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type CookStory = {
  id: string;
  cook_id: string;
  title: string;
  description: string | null;
  menu_items: string[] | null;
  photo_url: string | null;
  is_active: boolean;
  expires_at: string;
  created_at: string;
};

export type UserStreak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_swipe_date: string;
  super_likes_available: number;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  match_id: string;
  buyer_id: string;
  cook_id: string;
  status: ServiceStatus;
  dish_name: string;
  price: number;
  scheduled_date: string | null;
  location: string | null;
  notes: string | null;
  agreed_by_both: boolean;
  agreed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  service_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type CookEarnings = {
  id: string;
  cook_id: string;
  service_id: string;
  amount_earned: number;
  platform_fee_percent: number;
  amount_paid: number;
  payment_date: string | null;
  status: "unpaid" | "processing" | "paid";
  created_at: string;
  updated_at: string;
};

export type Referral = {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_amount: number;
  status: "pending" | "completed";
  completed_at: string | null;
  created_at: string;
};

export type WalletTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "referral" | "payment_received" | "payment_sent" | "admin_credit";
  description: string | null;
  reference_id: string | null;
  created_at: string;
};
