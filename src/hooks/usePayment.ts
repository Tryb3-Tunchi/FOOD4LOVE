import { useCallback, useState } from "react";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
  initializeFlutterwavePayment,
  verifyFlutterwavePayment,
  ACTIVE_PROVIDER,
} from "../lib/paymentProvider";
import type { PaymentRequest, PaymentResponse } from "../lib/paymentProvider";

type UsePaymentState = {
  isLoading: boolean;
  error: string | null;
  paymentUrl: string | null;
  initiatePayment: (request: PaymentRequest) => Promise<PaymentResponse | null>;
  verifyPayment: (reference: string) => Promise<boolean>;
};

/**
 * Hook to handle payment operations with configured provider
 */
export function usePayment(): UsePaymentState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const initiatePayment = useCallback(async (request: PaymentRequest): Promise<PaymentResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let response: PaymentResponse;

      if (ACTIVE_PROVIDER === "paystack") {
        response = await initializePaystackPayment(request);
      } else {
        response = await initializeFlutterwavePayment(request);
      }

      if (response.success && response.data?.authorizationUrl) {
        setPaymentUrl(response.data.authorizationUrl);
        return response;
      }

      if (!response.success) {
        setError(response.message);
        return null;
      }

      return response;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment initialization failed";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPayment = useCallback(async (reference: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: { success: boolean; message: string; amount?: number };

      if (ACTIVE_PROVIDER === "paystack") {
        result = await verifyPaystackPayment(reference);
      } else {
        result = await verifyFlutterwavePayment(reference);
      }

      if (!result.success) {
        setError(result.message);
        return false;
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment verification failed";
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    paymentUrl,
    initiatePayment,
    verifyPayment,
  };
}
