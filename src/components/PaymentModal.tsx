import { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { XIcon } from "./ui/Icons";

type PaymentMethod = "transfer" | "wallet";

type PaymentModalProps = {
  isOpen: boolean;
  cookName: string;
  dishName: string;
  amount: number;
  onPay: (method: PaymentMethod) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

export function PaymentModal({
  isOpen,
  cookName,
  dishName,
  amount,
  onPay,
  onCancel,
  isLoading = false,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      await onPay(method);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <Card className="relative w-full max-w-sm space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Payment for {dishName}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              to {cookName}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <XIcon className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
          </button>
        </div>

        <div className="rounded-lg bg-brand-500/10 p-3 text-center dark:bg-brand-500/20">
          <div className="text-2xl font-bold text-brand-700 dark:text-brand-300">
            ₦{amount.toLocaleString()}
          </div>
          <div className="text-xs text-brand-600 dark:text-brand-400">
            Amount to pay
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Payment method
          </div>
          {[
            {
              id: "transfer" as const,
              label: "Bank Transfer",
              desc: "Direct transfer to cook's account",
            },
            {
              id: "wallet" as const,
              label: "Food4Love Wallet",
              desc: "Pay from your wallet (faster & protected)",
            },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMethod(opt.id)}
              className={`w-full rounded-lg border-2 p-3 text-left transition ${
                method === opt.id
                  ? "border-brand-500 bg-brand-500/10 dark:border-brand-400 dark:bg-brand-500/20"
                  : "border-black/10 bg-white/50 hover:border-brand-500/30 dark:border-white/10 dark:bg-slate-900/30"
              }`}
            >
              <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                {opt.label}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                {opt.desc}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-blue-200/50 bg-blue-50/50 p-2.5 dark:border-blue-500/30 dark:bg-blue-500/10">
          <div className="text-[10px] text-blue-700 dark:text-blue-300">
            💳 Your payment is secure. We verify all transactions and hold funds
            in escrow until the service is completed.
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={isLoading || isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handlePay}
            disabled={isLoading || isProcessing}
          >
            {isProcessing ? "Processing…" : "Pay Now"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
