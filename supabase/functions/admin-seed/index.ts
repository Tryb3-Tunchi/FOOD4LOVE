import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Input = {
  cooks?: number;
  buyers?: number;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const rand = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

const womenPhotos = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551069613-1904dbdcda11?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80",
];

const menPhotos = [
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542178243-bc20204b769f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=1200&q=80",
];

const foodPhotoPool = [
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1604908176997-125f25cc500c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
];

const nigerianCities = [
  { lat: 6.4541, lng: 3.3947 },
  { lat: 9.0765, lng: 7.3986 },
  { lat: 4.8156, lng: 7.0498 },
  { lat: 7.3775, lng: 3.9470 },
  { lat: 12.0022, lng: 8.5920 },
];

const cookTemplates = [
  {
    name: "Chioma",
    bio: "If you love smoky jollof, soft plantain, and proper stew — you're in the right place.",
    specialty: "Jollof Rice",
    cuisines: ["Nigerian", "West African"],
    interests: ["Home cooking", "Spicy", "Street food"],
    price_min: 2500,
    price_max: 7000,
    gender: "female" as const,
  },
  {
    name: "Tunde",
    bio: "Proper suya, hot yaji, and cold drinks. Come chop.",
    specialty: "Suya",
    cuisines: ["Nigerian", "Street Food"],
    interests: ["BBQ", "Spicy", "Late night"],
    price_min: 2000,
    price_max: 6000,
    gender: "male" as const,
  },
  {
    name: "Amina",
    bio: "Egusi that hits, pounded yam that stretches, and stew that behaves. Fully homemade.",
    specialty: "Egusi Soup",
    cuisines: ["Nigerian", "Igbo cuisine"],
    interests: ["Home cooking", "Healthy", "Traditional"],
    price_min: 3500,
    price_max: 9000,
    gender: "female" as const,
  },
  {
    name: "Sade",
    bio: "Efo riro with assorted meat. If you're serious, you'll lick the plate.",
    specialty: "Efo Riro",
    cuisines: ["Nigerian", "Yoruba cuisine"],
    interests: ["Home cooking", "Fine dining", "Spicy"],
    price_min: 5000,
    price_max: 15000,
    gender: "female" as const,
  },
  {
    name: "Emeka",
    bio: "Ofe onugbu, oha soup, and the best ofe akwu you'll ever taste in Lagos.",
    specialty: "Ofe Onugbu",
    cuisines: ["Nigerian", "Igbo cuisine"],
    interests: ["Traditional", "Home cooking", "Soups"],
    price_min: 4000,
    price_max: 12000,
    gender: "male" as const,
  },
  {
    name: "Bola",
    bio: "Soft moi moi, akara that's not oily, and pap that's smooth. Brunch done right.",
    specialty: "Moi Moi",
    cuisines: ["Nigerian"],
    interests: ["Brunch", "Healthy", "Home cooking"],
    price_min: 2000,
    price_max: 5000,
    gender: "female" as const,
  },
  {
    name: "Adaeze",
    bio: "Catfish pepper soup to cure anything — heartbreak, cold, or just hunger.",
    specialty: "Catfish Pepper Soup",
    cuisines: ["Nigerian", "River states"],
    interests: ["Comfort food", "Spicy", "Late night"],
    price_min: 3000,
    price_max: 8500,
    gender: "female" as const,
  },
  {
    name: "Segun",
    bio: "Ofada rice and ayamase stew the way your grandma made it — but better.",
    specialty: "Ofada Rice",
    cuisines: ["Nigerian", "Yoruba cuisine"],
    interests: ["Traditional", "Home cooking", "Unique"],
    price_min: 3500,
    price_max: 10000,
    gender: "male" as const,
  },
  {
    name: "Fatima",
    bio: "Tuwo shinkafa, miyan kuka, dan wake — I bring the North to your doorstep.",
    specialty: "Northern Nigerian",
    cuisines: ["Nigerian", "Hausa cuisine"],
    interests: ["Traditional", "Home cooking", "Healthy"],
    price_min: 2500,
    price_max: 7500,
    gender: "female" as const,
  },
  {
    name: "Chukwudi",
    bio: "Nkwobi, peppered ponmo, asun — the full owambe experience delivered private.",
    specialty: "Nkwobi",
    cuisines: ["Nigerian", "Igbo cuisine"],
    interests: ["Party food", "Spicy", "BBQ"],
    price_min: 4500,
    price_max: 14000,
    gender: "male" as const,
  },
  {
    name: "Kemi",
    bio: "Continental with a Nigerian twist. Pasta, steak, fried rice that actually slaps.",
    specialty: "Nigerian Continental",
    cuisines: ["Nigerian", "Continental"],
    interests: ["Fine dining", "Creative", "Fusion"],
    price_min: 6000,
    price_max: 20000,
    gender: "female" as const,
  },
  {
    name: "Biodun",
    bio: "Banga soup, starch, and fresh periwinkle. Delta boy, Lagos based.",
    specialty: "Banga Soup",
    cuisines: ["Nigerian", "Delta cuisine"],
    interests: ["Traditional", "Seafood", "Home cooking"],
    price_min: 3500,
    price_max: 9000,
    gender: "male" as const,
  },
  {
    name: "Ngozi",
    bio: "Ofe akwu, ofe owerri, abacha — everything from scratch, no shortcuts.",
    specialty: "Ofe Akwu",
    cuisines: ["Nigerian", "Igbo cuisine"],
    interests: ["Traditional", "Home cooking", "Authentic"],
    price_min: 3000,
    price_max: 8000,
    gender: "female" as const,
  },
  {
    name: "Yakubu",
    bio: "Kilishi, kuli kuli, masa — Northern flavours, Lagos price.",
    specialty: "Kilishi",
    cuisines: ["Nigerian", "Hausa cuisine"],
    interests: ["Snacks", "Street food", "BBQ"],
    price_min: 2000,
    price_max: 5500,
    gender: "male" as const,
  },
  {
    name: "Toyin",
    bio: "Small chops queen. Puff puff, spring rolls, samosa, asun — your party sorted.",
    specialty: "Small Chops",
    cuisines: ["Nigerian"],
    interests: ["Party food", "Snacks", "Events"],
    price_min: 3000,
    price_max: 9000,
    gender: "female" as const,
  },
  {
    name: "Eze",
    bio: "Ukwa, ofe nmanu, achicha — traditional Igbo food for those who know.",
    specialty: "Ukwa",
    cuisines: ["Nigerian", "Igbo cuisine"],
    interests: ["Traditional", "Rare dishes", "Authentic"],
    price_min: 4000,
    price_max: 11000,
    gender: "male" as const,
  },
];

const buyerTemplates = [
  {
    name: "Zara",
    bio: "I'm here for good vibes and better food. Swipe me right for a home-cooked miracle.",
    cuisines: ["Nigerian", "Continental"],
    interests: ["Brunch", "Coffee", "Desserts"],
    gender: "female" as const,
  },
  {
    name: "Chinedu",
    bio: "If the stew no pepper, we fit add am. I'm a serious food person.",
    cuisines: ["Nigerian"],
    interests: ["Street food", "Spicy", "BBQ"],
    gender: "male" as const,
  },
  {
    name: "Ifeoma",
    bio: "Looking for a cook who can do swallow and soup right. Show me your egusi.",
    cuisines: ["Nigerian", "Igbo cuisine"],
    interests: ["Home cooking", "Traditional", "Soups"],
    gender: "female" as const,
  },
  {
    name: "Damilola",
    bio: "Busy Lagos girl who needs someone to cook proper food at home. Help me.",
    cuisines: ["Nigerian"],
    interests: ["Home cooking", "Healthy", "Quick meals"],
    gender: "female" as const,
  },
  {
    name: "Tolu",
    bio: "I judge cooks by their jollof. Pass the test and we're talking.",
    cuisines: ["Nigerian", "West African"],
    interests: ["Spicy", "Comfort food", "Street food"],
    gender: "male" as const,
  },
  {
    name: "Blessing",
    bio: "Continental and Nigerian — I eat everything. Just make it good.",
    cuisines: ["Nigerian", "Continental"],
    interests: ["Fine dining", "Creative", "Fusion"],
    gender: "female" as const,
  },
  {
    name: "Obinna",
    bio: "I need a cook who respects pepper soup and pounded yam. That's all.",
    cuisines: ["Nigerian", "Igbo cuisine"],
    interests: ["Traditional", "Soups", "Comfort food"],
    gender: "male" as const,
  },
  {
    name: "Hauwa",
    bio: "Northern girl in Lagos missing proper tuwo and miyan. Come save me.",
    cuisines: ["Nigerian", "Hausa cuisine"],
    interests: ["Traditional", "Home cooking", "Authentic"],
    gender: "female" as const,
  },
  {
    name: "Ayo",
    bio: "Party planner who needs small chops and full catering. Let's talk business.",
    cuisines: ["Nigerian"],
    interests: ["Party food", "Events", "Snacks"],
    gender: "male" as const,
  },
  {
    name: "Chidinma",
    bio: "Work from home, eat from home. Need a cook 3x per week minimum.",
    cuisines: ["Nigerian"],
    interests: ["Healthy", "Quick meals", "Meal prep"],
    gender: "female" as const,
  },
  {
    name: "Femi",
    bio: "I appreciate good food the way people appreciate art. Impress me.",
    cuisines: ["Nigerian", "Continental"],
    interests: ["Fine dining", "Creative", "Exotic"],
    gender: "male" as const,
  },
  {
    name: "Adaora",
    bio: "Grew up on real Igbo food and I refuse to settle for less now.",
    cuisines: ["Nigerian", "Igbo cuisine"],
    interests: ["Traditional", "Authentic", "Home cooking"],
    gender: "female" as const,
  },
  {
    name: "Kunle",
    bio: "Food is love. If you cook with heart, I'll eat with joy. Simple math.",
    cuisines: ["Nigerian", "Yoruba cuisine"],
    interests: ["Spicy", "Street food", "BBQ"],
    gender: "male" as const,
  },
  {
    name: "Nneka",
    bio: "Vegetarian-leaning but I'll eat fish. Cook me something beautiful.",
    cuisines: ["Nigerian"],
    interests: ["Healthy", "Fusion", "Creative"],
    gender: "female" as const,
  },
  {
    name: "Babatunde",
    bio: "I want proper amala and gbegiri. Everything else is bonus.",
    cuisines: ["Nigerian", "Yoruba cuisine"],
    interests: ["Traditional", "Soups", "Comfort food"],
    gender: "male" as const,
  },
  {
    name: "Chiamaka",
    bio: "Health-conscious but won't say no to Nigerian food done right.",
    cuisines: ["Nigerian"],
    interests: ["Healthy", "Home cooking", "Traditional"],
    gender: "female" as const,
  },
];

const serve = (
  globalThis as unknown as {
    Deno?: {
      serve?: (handler: (req: Request) => Response | Promise<Response>) => void;
    };
  }
).Deno?.serve;
const getEnv = (key: string) =>
  (
    globalThis as unknown as {
      Deno?: { env?: { get?: (k: string) => string | undefined } };
    }
  ).Deno?.env?.get?.(key) ?? "";

if (!serve) {
  throw new Error("Deno.serve is not available in this runtime.");
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return json(500, { error: "Missing Supabase env in Edge Function" });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json(401, { error: "Missing Authorization header" });

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user)
    return json(401, { error: "Not authenticated" });
  const requesterId = userData.user.id;

  const admin = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data: me, error: meError } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", requesterId)
    .single();
  if (meError || !me || (me as { is_admin?: boolean }).is_admin !== true) {
    return json(403, { error: "Admin only" });
  }

  let input: Input = {};
  try {
    input = (await req.json()) as Input;
  } catch {
    input = {};
  }

  const cooks = Math.max(0, Math.min(50, Number(input.cooks ?? 10)));
  const buyers = Math.max(0, Math.min(50, Number(input.buyers ?? 10)));

  const created: Array<{ id: string; email: string; role: string }> = [];

  for (let i = 0; i < cooks; i++) {
    const t = cookTemplates[i % cookTemplates.length];
    const token = rand();
    const safeName = t.name.toLowerCase().replace(/\s+/g, "");
    const email = `bot.cook.${safeName}.${token}@example.com`;
    const password = rand() + "A1!";

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: t.name, nickname: t.name },
    });
    if (error || !data.user) continue;
    const u = data.user;

    const photoPool = t.gender === "female" ? womenPhotos : menPhotos;
    const avatarIdx = i % photoPool.length;
    const avatarUrl = photoPool[avatarIdx];
    const extraFacePhoto = photoPool[(avatarIdx + 4) % photoPool.length];
    const foodPhoto1 = foodPhotoPool[i % foodPhotoPool.length];
    const foodPhoto2 = foodPhotoPool[(i + 5) % foodPhotoPool.length];
    const photos = [extraFacePhoto, foodPhoto1, foodPhoto2];

    const loc = nigerianCities[i % nigerianCities.length];
    const latJitter = (Math.random() - 0.5) * 0.15;
    const lngJitter = (Math.random() - 0.5) * 0.15;

    await admin.from("profiles").upsert({
      id: u.id,
      role: "cook",
      name: t.name,
      nickname: t.name,
      looking_for: "Clients who appreciate real food",
      age: 21 + (i % 14),
      avatar_url: avatarUrl,
      phone: null,
      bio: t.bio,
      cuisines: t.cuisines,
      interests: t.interests,
      favorite_foods: [t.specialty],
      photos,
      specialty: t.specialty,
      price_min: t.price_min,
      price_max: t.price_max,
      is_bot: true,
      bot_persona:
        "Nigerian cook bot. Confident about their food. Warm but professional. Short replies. Offers to cook soon.",
      is_admin: false,
      onboarding_completed: true,
      kyc_status: "verified",
      kyc_full_name: t.name,
      kyc_country: "Nigeria",
      kyc_selfie: null,
      kyc_id_doc: null,
      lat: loc.lat + latJitter,
      lng: loc.lng + lngJitter,
    });
    created.push({ id: u.id, email, role: "cook" });
  }

  for (let i = 0; i < buyers; i++) {
    const t = buyerTemplates[i % buyerTemplates.length];
    const token = rand();
    const safeName = t.name.toLowerCase().replace(/\s+/g, "");
    const email = `bot.buyer.${safeName}.${token}@example.com`;
    const password = rand() + "A1!";

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: t.name, nickname: t.name },
    });
    if (error || !data.user) continue;
    const u = data.user;

    const photoPool = t.gender === "female" ? womenPhotos : menPhotos;
    const avatarIdx = (i + 6) % photoPool.length;
    const avatarUrl = photoPool[avatarIdx];
    const extraPhoto = photoPool[(avatarIdx + 5) % photoPool.length];

    const loc = nigerianCities[i % nigerianCities.length];
    const latJitter = (Math.random() - 0.5) * 0.12;
    const lngJitter = (Math.random() - 0.5) * 0.12;

    await admin.from("profiles").upsert({
      id: u.id,
      role: "buyer",
      name: t.name,
      nickname: t.name,
      looking_for: "Good home-cooked food",
      age: 20 + (i % 15),
      avatar_url: avatarUrl,
      phone: null,
      bio: t.bio,
      cuisines: t.cuisines,
      interests: t.interests,
      favorite_foods: null,
      photos: [extraPhoto],
      specialty: null,
      price_min: null,
      price_max: null,
      is_bot: true,
      bot_persona:
        "Nigerian buyer bot. Warm and playful, asks one question back, keeps it simple, suggests meeting for food.",
      is_admin: false,
      onboarding_completed: true,
      kyc_status: "unverified",
      kyc_full_name: null,
      kyc_country: "Nigeria",
      kyc_selfie: null,
      kyc_id_doc: null,
      lat: loc.lat + latJitter,
      lng: loc.lng + lngJitter,
    });
    created.push({ id: u.id, email, role: "buyer" });
  }

  return json(200, { createdCount: created.length, created });
});
