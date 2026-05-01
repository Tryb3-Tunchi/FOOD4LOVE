import { useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { XIcon } from "./ui/Icons";

export function ServiceAgreementModal({
  isOpen,
  dish_name,
  price,
  cookName,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  dish_name: string;
  price: number;
  cookName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const canConfirm = useMemo(() => agreedToTerms && !isLoading, [agreedToTerms, isLoading]);

  if (!isOpen) return null;

  const formatNaira = (n: number) => {
    if (n >= 1000) return `₦${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `₦${n}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <Card className="w-full max-w-md space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">
            Confirm service
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 rounded-2xl bg-black/5 p-4 dark:bg-white/8">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600 dark:text-zinc-400">Cook</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-50">{cookName}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-3 dark:border-white/10">
            <span className="text-sm text-slate-600 dark:text-zinc-400">Dish</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-50">{dish_name}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-3 dark:border-white/10">
            <span className="text-sm text-slate-600 dark:text-zinc-400">Price</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">{formatNaira(price)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-5 w-5 rounded border-black/20 text-brand-500 dark:border-white/20"
            />
            <span className="text-sm text-slate-700 dark:text-zinc-200">
              I agree to this service. The cook will prepare the meal and we'll confirm completion once done.
            </span>
          </label>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            variant="primary"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            {isLoading ? "Confirming…" : "Confirm service"}
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-slate-500 dark:text-zinc-500">
          By confirming, you authorize this payment and agree to the service terms.
        </p>
      </Card>
    </div>
  );
}
