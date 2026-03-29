import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Input = {
  matchId: string;
};

type MatchRow = {
  id: string;
  buyer_id: string;
  cook_id: string;
};

type ProfileRow = {
  id: string;
  is_bot: boolean;
  bot_persona: string | null;
  nickname: string | null;
  name: string;
};

type MessageRow = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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
  const groqApiKey = getEnv("GROQ_API_KEY");
  const groqModel = getEnv("GROQ_MODEL") || "llama-3.1-8b-instant";

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return json(500, { error: "Missing Supabase env in Edge Function" });
  }
  if (!groqApiKey) return json(500, { error: "Missing GROQ_API_KEY" });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json(401, { error: "Missing Authorization header" });

  let input: Input;
  try {
    input = (await req.json()) as Input;
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const matchId = (input.matchId ?? "").trim();
  if (!matchId) return json(400, { error: "matchId is required" });

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user)
    return json(401, { error: "Not authenticated" });
  const userId = userData.user.id;

  const admin = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: match, error: matchError } = await admin
    .from("matches")
    .select("id,buyer_id,cook_id")
    .eq("id", matchId)
    .single();
  if (matchError || !match) return json(404, { error: "Match not found" });

  const m = match as MatchRow;
  const isParticipant = m.buyer_id === userId || m.cook_id === userId;
  if (!isParticipant) return json(403, { error: "Forbidden" });

  const botId = m.buyer_id === userId ? m.cook_id : m.buyer_id;

  const { data: botProfile, error: botError } = await admin
    .from("profiles")
    .select("id,is_bot,bot_persona,nickname,name")
    .eq("id", botId)
    .single();
  if (botError || !botProfile) return json(204, {});

  const bot = botProfile as ProfileRow;
  if (!bot.is_bot) return json(204, {});

  const { data: msgRows, error: msgError } = await admin
    .from("messages")
    .select("id,match_id,sender_id,body,created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
    .limit(40);
  if (msgError) return json(500, { error: "Failed to load messages" });
  const msgs = (msgRows as MessageRow[]) ?? [];
  if (msgs.length > 0 && msgs[msgs.length - 1]?.sender_id === botId)
    return json(204, {});

  const persona = bot.bot_persona?.trim()
    ? bot.bot_persona.trim()
    : "Warm, confident, and playful. Keep replies short and human. Ask one question back.";
  const botName = bot.nickname ?? bot.name;

  const groqMessages = [
    {
      role: "system",
      content:
        `You are ${botName} in a dating + food app chat. Persona: ${persona}\n` +
        "Rules: keep it natural, 1-3 short paragraphs max, no emojis unless the other person used emojis first, avoid explicit content, suggest a simple plan if the vibe is good.",
    },
    ...msgs.slice(-20).map((x) => ({
      role: x.sender_id === botId ? "assistant" : "user",
      content: x.body,
    })),
  ];

  const groqRes = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel,
        messages: groqMessages,
        temperature: 0.8,
        max_tokens: 220,
      }),
    },
  );

  if (!groqRes.ok) {
    const text = await groqRes.text();
    return json(502, {
      error: "Groq request failed",
      details: text.slice(0, 500),
    });
  }

  const groqJson = (await groqRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = groqJson.choices?.[0]?.message?.content?.trim() ?? "";
  if (!reply) return json(204, {});

  const { data: inserted, error: insertError } = await admin
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: botId,
      body: reply,
    })
    .select("*")
    .single();

  if (insertError) return json(500, { error: "Failed to insert bot message" });
  return json(200, { message: inserted });
});
