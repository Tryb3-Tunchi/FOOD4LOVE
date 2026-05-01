import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ChatBubble } from "../components/ui/ChatBubble";
import { KycPromptModal } from "../components/KycPromptModal";
import { ServiceAgreementModal } from "../components/ServiceAgreementModal";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { useService } from "../hooks/useService";
import { filterMessage } from "../lib/messageFilter";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/db";

export function ChatPage() {
  const params = useParams();
  const matchId = params.matchId ?? "";
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isLoading, messages, sendMessage } = useChat({
    matchId,
    userId: user?.id ?? null,
  });
  const { service, markCompleted } = useService(matchId);

  const [draft, setDraft] = useState("");
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [showKycPrompt, setShowKycPrompt] = useState(false);
  const [showServiceAgreement, setShowServiceAgreement] = useState(false);
  const [dishName, setDishName] = useState("");
  const [price, setPrice] = useState(0);
  const [isConfirmingService, setIsConfirmingService] = useState(false);
  const [messageError, setMessageError] = useState<string>("");
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isCook = profile?.role === "cook";
  const kycVerified = profile?.kyc_status === "verified";
  const otherIsVerified = otherProfile?.kyc_status === "verified";

  const canSend = useMemo(() => draft.trim().length > 0 && kycVerified, [draft, kycVerified]);

  // Load other user profile
  useEffect(() => {
    const loadOtherProfile = async () => {
      if (!user?.id || !matchId) return;

      const { data: match } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .maybeSingle();

      if (!match) return;

      const otherId = match.buyer_id === user.id ? match.cook_id : match.buyer_id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherId)
        .maybeSingle();

      if (profile) setOtherProfile(profile as Profile);
    };

    loadOtherProfile();
  }, [user?.id, matchId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Show KYC prompt if not verified and trying to chat
  useEffect(() => {
    if (!kycVerified && messages.length > 0) {
      setShowKycPrompt(true);
    }
  }, [kycVerified, messages.length]);

  const handleServiceAgreement = async () => {
    setIsConfirmingService(true);
    try {
      const { error } = await supabase.from("services").insert({
        match_id: matchId,
        buyer_id: isCook ? otherProfile?.id : user?.id,
        cook_id: isCook ? user?.id : otherProfile?.id,
        status: "pending",
        dish_name: dishName,
        price,
      });

      if (error) throw error;
      setShowServiceAgreement(false);
      setDishName("");
      setPrice(0);
    } catch (err) {
      console.error("Failed to create service:", err);
    } finally {
      setIsConfirmingService(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!service) return;
    setIsMarkingComplete(true);
    try {
      await markCompleted();
      // Navigate to rating page after 1 second
      setTimeout(() => {
        navigate(`/rating/${service.id}`);
      }, 1000);
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  if (!matchId) {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
        <Card className="p-4">
          <div className="text-sm text-slate-700 dark:text-zinc-200">
            Missing match id.
          </div>
          <Link className="mt-2 inline-block text-sm" to="/matches">
            Back to matches
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              {otherProfile?.nickname || otherProfile?.name || "Chat"}
            </span>
            {otherIsVerified && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ Verified
              </span>
            )}
          </div>
          {!kycVerified && (
            <div className="text-xs text-orange-600 dark:text-orange-400">
              ⚠️ Verify identity to message
            </div>
          )}
        </div>
        <Link to="/matches">
          <Button variant="ghost">Back</Button>
        </Link>
      </header>

      <Card className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
        <div className="flex-1 space-y-3 overflow-auto">
          {isLoading ? (
            <div className="text-sm text-slate-600 dark:text-zinc-300">
              Loading…
            </div>
          ) : null}
          {!isLoading && messages.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-zinc-300">
              Say hi and start the conversation.
            </div>
          ) : null}
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              isMine={m.sender_id === user?.id}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Service flow section */}
        {service && (
          <div className="space-y-2 border-t border-black/10 pt-3 dark:border-white/10">
            <div className="rounded-lg bg-brand-500/10 p-3 text-xs text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              <div className="font-semibold">Service: {service.dish_name}</div>
              <div>Status: {service.status}</div>
              <div className="mt-1 text-brand-600 dark:text-brand-400">
                ₦{service.price.toLocaleString()}
              </div>
            </div>

            {isCook && service.status === "confirmed" && (
              <Button
                variant="primary"
                className="w-full"
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
              >
                {isMarkingComplete ? "Marking complete…" : "Service complete"}
              </Button>
            )}
          </div>
        )}

        {/* Send message form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSend) return;
            
            // Filter message for blocked patterns
            const filterResult = filterMessage(draft);
            if (!filterResult.isClean) {
              setMessageError(filterResult.violations[0] || "Message contains blocked content");
              return;
            }
            
            setMessageError("");
            await sendMessage(filterResult.cleanedMessage);
            setDraft("");
          }}
          className="space-y-2"
        >
          {messageError && (
            <div className="rounded-lg bg-orange-500/10 p-2 text-xs text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
              {messageError}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={kycVerified ? "Type a message" : "Verify identity to message"}
              disabled={!kycVerified}
              className="flex-1 rounded-xl border border-black/10 bg-white/70 px-3 py-3 text-sm text-slate-900 outline-none ring-brand-400/40 focus:ring-2 disabled:opacity-50 dark:border-white/15 dark:bg-white/6 dark:text-zinc-100"
            />
            <Button type="submit" variant="primary" disabled={!canSend}>
              Send
            </Button>
          </div>

          {isCook && !service && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setShowServiceAgreement(true)}
            >
              Create service offer
            </Button>
          )}
        </form>
      </Card>

      {/* Modals */}
      <KycPromptModal
        isOpen={showKycPrompt}
        onClose={() => setShowKycPrompt(false)}
      />

      <ServiceAgreementModal
        isOpen={showServiceAgreement}
        dish_name={dishName}
        price={price}
        cookName={otherProfile?.nickname || otherProfile?.name || "Cook"}
        onConfirm={handleServiceAgreement}
        onCancel={() => setShowServiceAgreement(false)}
        isLoading={isConfirmingService}
      />
    </div>
  );
}
