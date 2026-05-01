import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PaymentModal } from "../components/PaymentModal";
import { useAuth } from "../hooks/useAuth";
import { useReviews } from "../hooks/useReviews";
import { useWallet } from "../hooks/useWallet";
import { supabase } from "../lib/supabase";
import { initializePaystackPayment, verifyPaystackPayment } from "../lib/paymentProvider";
import type { Service, Profile } from "../types/db";

export function RatingPage() {
  const params = useParams();
  const serviceId = params.serviceId ?? "";
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addCredit } = useWallet(user?.id ?? null);

  const [service, setService] = useState<Service | null>(null);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const { reviews, hasReviewed } = useReviews(serviceId, user?.id ?? null);

  // Load service and other user
  useEffect(() => {
    const load = async () => {
      const { data: svc } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .maybeSingle();

      if (svc) {
        const s = svc as Service;
        setService(s);

        const otherId = s.buyer_id === user?.id ? s.cook_id : s.buyer_id;
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherId)
          .maybeSingle();

        if (prof) setOtherProfile(prof as Profile);
      }
    };

    load();
  }, [serviceId, user?.id]);

  const isBuyer = service?.buyer_id === user?.id;
  const canSubmit = useMemo(
    () => !isSubmitting && !hasReviewed && rating >= 1 && rating <= 5 && (isPaid || !isBuyer),
    [isSubmitting, hasReviewed, rating, isPaid, isBuyer]
  );

  const handlePay = async () => {
    if (!service || !user?.id || !profile) return;

    setIsPaying(true);
    setError(null);

    try {
      // Generate reference for payment
      const reference = `FOOD4_${Date.now()}`;

      // Initialize payment with Paystack
      const paymentInit = await initializePaystackPayment({
        amount: service.price,
        email: profile.email || user.email || "user@food4love.com",
        fullName: profile.name || "User",
        userId: user.id,
        serviceId: service.id,
        reference,
      });

      if (!paymentInit.success) {
        throw new Error(paymentInit.message);
      }

      setPaymentReference(paymentInit.data?.accessCode || reference);

      // In production, redirect user to Paystack payment page
      if (paymentInit.data?.authorizationUrl) {
        // Open Paystack payment page
        const popup = window.open(paymentInit.data.authorizationUrl, "_blank");
        
        // Poll for payment status
        let completed = false;
        const pollInterval = setInterval(async () => {
          const result = await verifyPaystackPayment(paymentInit.data?.accessCode || reference);
          
          if (result.success) {
            clearInterval(pollInterval);
            completed = true;
            
            // Create earnings record for cook
            await supabase.from("cook_earnings").insert({
              cook_id: service.cook_id,
              service_id: service.id,
              amount_earned: service.price,
              platform_fee_percent: 10,
              amount_paid: Math.floor(service.price * 0.9),
              status: "paid",
              payment_date: new Date().toISOString(),
            });

            // Add 700 naira to buyer's wallet as referral bonus
            await addCredit(700, "referral", "Payment referral bonus");

            // Record transaction
            await supabase.from("wallet_transactions").insert({
              user_id: user.id,
              amount: 700,
              type: "referral",
              description: "Payment completed referral bonus (₦700)",
              reference_id: service.id,
            });

            setIsPaid(true);
            popup?.close();
          }
        }, 2000);

        // Stop polling after 10 minutes
        setTimeout(() => clearInterval(pollInterval), 600000);
      } else {
        // Fallback: Mark as paid immediately (for testing)
        // In production, this should only happen after real payment
        const result = await verifyPaystackPayment(reference);
        
        if (result.success) {
          await supabase.from("cook_earnings").insert({
            cook_id: service.cook_id,
            service_id: service.id,
            amount_earned: service.price,
            platform_fee_percent: 10,
            amount_paid: Math.floor(service.price * 0.9),
            status: "paid",
            payment_date: new Date().toISOString(),
          });

          await addCredit(700, "referral", "Payment referral bonus");

          setIsPaid(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !serviceId || !user?.id) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: err } = await supabase.from("reviews").insert({
        service_id: serviceId,
        reviewer_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

      if (err) throw err;

      setTimeout(() => {
        navigate("/matches", { replace: true });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service || !otherProfile) {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
        <Card className="p-4">
          <div className="text-sm text-slate-700 dark:text-zinc-200">Loading…</div>
        </Card>
      </div>
    );
  }

  if (hasReviewed) {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
        <Card className="space-y-4 p-6">
          <div className="text-center">
            <div className="text-3xl">✓</div>
            <h1 className="mt-2 font-semibold text-slate-900 dark:text-zinc-50">
              Review submitted
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Thanks for rating {otherProfile.nickname || otherProfile.name}!
          </p>
          <Button
            className="w-full"
            variant="primary"
            onClick={() => navigate("/matches", { replace: true })}
          >
            Back to matches
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
          Rate this experience
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
          How was your experience with {otherProfile.nickname || otherProfile.name}?
        </p>
      </header>

      <Card className="space-y-6 p-6">
        {/* Dish info */}
        <div className="rounded-lg bg-black/5 p-4 dark:bg-white/8">
          <div className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
            {service.dish_name}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
            Completed {new Date(service.completed_at!).toLocaleDateString()}
          </div>
          <div className="mt-2 font-bold text-brand-700 dark:text-brand-300">
            ₦{service.price.toLocaleString()}
          </div>
        </div>

        {/* Payment status */}
        {isBuyer && !isPaid && (
          <div className="rounded-lg border border-orange-200/50 bg-orange-50/50 p-3 dark:border-orange-500/30 dark:bg-orange-500/10">
            <div className="text-xs font-semibold text-orange-700 dark:text-orange-300">
              ⚠️ Payment required
            </div>
            <div className="mt-1 text-[10px] text-orange-600 dark:text-orange-400">
              Please pay the cook before submitting your rating.
            </div>
          </div>
        )}

        {isBuyer && isPaid && (
          <div className="rounded-lg border border-green-200/50 bg-green-50/50 p-3 dark:border-green-500/30 dark:bg-green-500/10">
            <div className="text-xs font-semibold text-green-700 dark:text-green-300">
              ✓ Paid to {otherProfile.nickname || otherProfile.name}
            </div>
            <div className="mt-1 text-[10px] text-green-600 dark:text-green-400">
              ₦{service.price.toLocaleString()} paid • Earnings visible in cook's account
            </div>
          </div>
        )}

        {/* Star rating */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900 dark:text-zinc-50">
            Your rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`h-12 w-12 rounded-xl transition ${
                  r <= rating
                    ? "bg-brand-500 text-white"
                    : "bg-black/10 text-black/30 dark:bg-white/10 dark:text-white/30"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900 dark:text-zinc-50">
            Optional comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this meal (optional)"
            maxLength={500}
            className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-3 text-sm text-slate-900 outline-none ring-brand-400/40 focus:ring-2 dark:border-white/15 dark:bg-white/6 dark:text-zinc-100"
            rows={4}
          />
          <div className="text-xs text-slate-500 dark:text-zinc-500">
            {comment.length}/500
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {isBuyer && !isPaid && (
            <Button
              className="flex-1"
              variant="primary"
              onClick={() => setShowPayment(true)}
            >
              Pay now
            </Button>
          )}
          <Button
            className={isBuyer && !isPaid ? "flex-1" : "w-full"}
            variant={isBuyer && !isPaid ? "secondary" : "primary"}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? "Submitting…" : "Submit review"}
          </Button>
        </div>
      </Card>

      <PaymentModal
        isOpen={showPayment}
        cookName={otherProfile.nickname || otherProfile.name}
        dishName={service.dish_name}
        amount={service.price}
        onPay={handlePay}
        onCancel={() => setShowPayment(false)}
        isLoading={isPaying}
      />
    </div>
  );
}
