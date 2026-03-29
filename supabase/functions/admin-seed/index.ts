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

const facePhotos = {
  women: [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524503033411-f7a2fe8c7c6f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520975693411-b00b49b9d4fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524503033411-f7a2fe8c7c6f?auto=format&fit=crop&w=1200&q=80",
  ],
  men: [
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80",
  ],
};

const foodPhotos: Record<string, string> = {
  "Jollof Rice":
    "https://images.unsplash.com/photo-1604908176997-125f25cc500c?auto=format&fit=crop&w=1200&q=80",
  "Fried Plantain":
    "https://images.unsplash.com/photo-1604908554027-30fbd138c4b6?auto=format&fit=crop&w=1200&q=80",
  Chicken:
    "https://images.unsplash.com/photo-1604908177064-8b7f52c16e34?auto=format&fit=crop&w=1200&q=80",
  Suya: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  "Yaji spice":
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  "Onions + tomatoes":
    "https://images.unsplash.com/photo-1566843972142-a0fcb1d3d7e8?auto=format&fit=crop&w=1200&q=80",
  "Egusi Soup":
    "https://images.unsplash.com/photo-1604908177171-8cd9bfb4d2f3?auto=format&fit=crop&w=1200&q=80",
  "Pounded Yam":
    "https://images.unsplash.com/photo-1604908177094-4f9b2f1f5b55?auto=format&fit=crop&w=1200&q=80",
  Semo: "https://images.unsplash.com/photo-1604908177094-4f9b2f1f5b55?auto=format&fit=crop&w=1200&q=80",
  "Ofada Rice":
    "https://images.unsplash.com/photo-1604908176997-125f25cc500c?auto=format&fit=crop&w=1200&q=80",
  "Ayamase stew":
    "https://images.unsplash.com/photo-1604908177148-1d9a9d37b04b?auto=format&fit=crop&w=1200&q=80",
  "Goat Pepper Soup":
    "https://images.unsplash.com/photo-1604908177214-6fbc6f2c3dfd?auto=format&fit=crop&w=1200&q=80",
  "Catfish Pepper Soup":
    "https://images.unsplash.com/photo-1604908177214-6fbc6f2c3dfd?auto=format&fit=crop&w=1200&q=80",
  "Peppered Ponmo":
    "https://images.unsplash.com/photo-1604908177186-8b6b15bf95df?auto=format&fit=crop&w=1200&q=80",
  Nkwobi:
    "https://images.unsplash.com/photo-1604908177186-8b6b15bf95df?auto=format&fit=crop&w=1200&q=80",
  "Peppered Snail":
    "https://images.unsplash.com/photo-1604908177186-8b6b15bf95df?auto=format&fit=crop&w=1200&q=80",
  "Palm wine":
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80",
  "Efo Riro":
    "https://images.unsplash.com/photo-1604908177148-1d9a9d37b04b?auto=format&fit=crop&w=1200&q=80",
  "Assorted meat":
    "https://images.unsplash.com/photo-1604908177064-8b7f52c16e34?auto=format&fit=crop&w=1200&q=80",
  "Moi Moi":
    "https://images.unsplash.com/photo-1604908177126-d3a7a6c6901a?auto=format&fit=crop&w=1200&q=80",
  Pap: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80",
  Akara:
    "https://images.unsplash.com/photo-1604908177111-104b7a3d2e21?auto=format&fit=crop&w=1200&q=80",
  "Fried Rice":
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
};

const pickGallery = (avatar: string | null, pool: string[]) => {
  if (!avatar) return null;
  const out: string[] = [avatar];
  for (const u of pool) {
    if (out.length >= 5) break;
    if (!out.includes(u)) out.push(u);
  }
  return out.slice(0, 5);
};

const cookTemplates = [
  {
    name: "Chioma",
    specialty: "Jollof Rice",
    cuisines: ["Nigerian"],
    interests: ["Home cooking", "Spicy"],
  },
  {
    name: "Tunde",
    specialty: "Suya",
    cuisines: ["Nigerian"],
    interests: ["Street food", "BBQ"],
  },
  {
    name: "Amina",
    specialty: "Egusi Soup",
    cuisines: ["Nigerian"],
    interests: ["Home cooking", "Healthy"],
  },
  {
    name: "Kelechi",
    specialty: "Ofada Rice",
    cuisines: ["Nigerian"],
    interests: ["Home cooking", "Spicy"],
  },
  {
    name: "Zainab",
    specialty: "Pepper Soup",
    cuisines: ["Nigerian"],
    interests: ["Spicy", "Seafood"],
  },
  {
    name: "Ifeanyi",
    specialty: "Nkwobi",
    cuisines: ["Nigerian"],
    interests: ["Street food", "Spicy"],
  },
  {
    name: "Sade",
    specialty: "Efo Riro + Pounded Yam",
    cuisines: ["Nigerian"],
    interests: ["Fine dining", "Home cooking"],
  },
  {
    name: "Bola",
    specialty: "Moi Moi",
    cuisines: ["Nigerian"],
    interests: ["Healthy", "Home cooking"],
  },
  {
    name: "Femi",
    specialty: "Fried Rice",
    cuisines: ["Nigerian"],
    interests: ["Brunch", "Home cooking"],
  },
  {
    name: "Ada",
    specialty: "Akara + Pap",
    cuisines: ["Nigerian"],
    interests: ["Brunch", "Street food"],
  },
];

const buyerTemplates = [
  { name: "Ngozi", interests: ["Desserts", "Brunch"], cuisines: ["Nigerian"] },
  { name: "Uche", interests: ["Street food", "Spicy"], cuisines: ["Nigerian"] },
  { name: "Chinedu", interests: ["BBQ", "Coffee"], cuisines: ["Nigerian"] },
  {
    name: "Fatima",
    interests: ["Healthy", "Fine dining"],
    cuisines: ["Nigerian"],
  },
  {
    name: "Emeka",
    interests: ["Home cooking", "Spicy"],
    cuisines: ["Nigerian"],
  },
  { name: "Hauwa", interests: ["Brunch", "Coffee"], cuisines: ["Nigerian"] },
  { name: "Bisi", interests: ["Desserts", "Coffee"], cuisines: ["Nigerian"] },
  { name: "Yusuf", interests: ["Street food", "BBQ"], cuisines: ["Nigerian"] },
];

const cookMenus: Record<string, string[]> = {
  "Jollof Rice": ["Jollof Rice", "Fried Plantain", "Chicken"],
  Suya: ["Suya", "Yaji spice", "Onions + tomatoes"],
  "Egusi Soup": ["Egusi Soup", "Pounded Yam", "Semo"],
  "Ofada Rice": ["Ofada Rice", "Ayamase stew", "Fried Plantain"],
  "Pepper Soup": ["Goat Pepper Soup", "Catfish Pepper Soup", "Peppered Ponmo"],
  Nkwobi: ["Nkwobi", "Peppered Snail", "Palm wine"],
  "Efo Riro + Pounded Yam": ["Efo Riro", "Pounded Yam", "Assorted meat"],
  "Moi Moi": ["Moi Moi", "Pap", "Akara"],
  "Fried Rice": ["Fried Rice", "Jollof Rice", "Chicken"],
  "Akara + Pap": ["Akara", "Pap", "Moi Moi"],
};

const pickPriceRange = (i: number) => {
  const tiers = [
    [2000, 3500],
    [3000, 5000],
    [4000, 6500],
    [6000, 9000],
    [8000, 12000],
    [10000, 15000],
  ] as const;
  const t = tiers[i % tiers.length];
  return { min: t[0], max: t[1] };
};

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
    const price = pickPriceRange(i);
    const token = rand();
    const email = `bot.${t.name.toLowerCase()}.${token}@example.com`;
    const password = rand() + "A1!";
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: t.name, nickname: t.name },
    });
    if (error || !data.user) continue;
    const u = data.user;
    await admin.from("profiles").upsert({
      id: u.id,
      role: "cook",
      name: t.name,
      nickname: t.name,
      looking_for: "Food dates and loyal customers",
      age: 24 + (i % 10),
      avatar_url: null,
      phone: null,
      bio: `I make the best ${t.specialty} in town. Come hungry.`,
      cuisines: t.cuisines,
      interests: t.interests,
      favorite_foods: [t.specialty],
      photos: null,
      specialty: t.specialty,
      price_min: price.min,
      price_max: price.max,
      is_bot: true,
      bot_persona:
        "Nigerian cook bot. Friendly, confident, short replies. Suggests a simple order or a date plan around food. Uses Nigerian expressions lightly.",
      is_admin: false,
      onboarding_completed: true,
      kyc_status: "verified",
      kyc_full_name: null,
      kyc_country: "Nigeria",
      kyc_selfie: null,
      kyc_id_doc: null,
      lat: null,
      lng: null,
    });

    const menu = cookMenus[t.specialty] ?? [
      t.specialty,
      "Fried Plantain",
      "Chicken",
    ];
    const toInsert = menu.slice(0, 3).map((name) => ({
      cook_id: u.id,
      name,
      image_url: null,
    }));
    await admin.from("dishes").insert(toInsert);
    created.push({ id: u.id, email, role: "cook" });
  }

  for (let i = 0; i < buyers; i++) {
    const t = buyerTemplates[i % buyerTemplates.length];
    const token = rand();
    const email = `bot.${t.name.toLowerCase()}.${token}@example.com`;
    const password = rand() + "A1!";
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: t.name, nickname: t.name },
    });
    if (error || !data.user) continue;
    const u = data.user;
    await admin.from("profiles").upsert({
      id: u.id,
      role: "buyer",
      name: t.name,
      nickname: t.name,
      looking_for: "Food dates",
      age: 22 + (i % 10),
      avatar_url: null,
      phone: null,
      bio: "I’m here for good vibes and better food.",
      cuisines: t.cuisines,
      interests: t.interests,
      favorite_foods: null,
      photos: null,
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
      lat: null,
      lng: null,
    });
    created.push({ id: u.id, email, role: "buyer" });
  }

  return json(200, { createdCount: created.length, created });
});
