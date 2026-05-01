import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { ShieldIcon } from "./ui/Icons";

export function KycPromptModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleStartKyc = () => {
    navigate("/kyc", { state: { from: location.pathname } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md rounded-t-3xl rounded-b-none border-b-0 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20">
            <ShieldIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-zinc-50">
              Verify your identity
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Required to start chatting
            </p>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-700 dark:text-zinc-200">
          We need to verify your identity to ensure safety on our platform. This is quick and secure.
        </p>

        <div className="mb-6 space-y-2">
          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-400">
            <span className="mt-1 text-brand-500">✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-400">
            <span className="mt-1 text-brand-500">✓</span>
            <span>Takes 2–3 minutes</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-400">
            <span className="mt-1 text-brand-500">✓</span>
            <span>Your data is encrypted</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            variant="primary"
            onClick={handleStartKyc}
          >
            Verify now
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            onClick={onClose}
          >
            Maybe later
          </Button>
        </div>
      </Card>
    </div>
  );
}
