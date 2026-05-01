/**
 * Payment Provider Integration (Paystack / Flutterwave)
 * Placeholder keys - Configure in environment variables
 */

export type PaymentProvider = "paystack" | "flutterwave";
export type PaymentMethod = "transfer" | "wallet" | "card";

// Payment provider configuration
export const PAYMENT_CONFIG = {
  paystack: {
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder_paystack",
    baseUrl: "https://api.paystack.co",
    fee: 1.5, // 1.5% fee
  },
  flutterwave: {
    publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST_placeholder",
    baseUrl: "https://api.flutterwave.com/v3",
    fee: 1.4, // 1.4% fee
  },
};

export const ACTIVE_PROVIDER: PaymentProvider = "paystack"; // Switch to "flutterwave" if needed

export type PaymentRequest = {
  amount: number; // Amount in naira
  email: string;
  fullName: string;
  userId: string;
  serviceId?: string;
  reference: string;
};

export type PaymentResponse = {
  success: boolean;
  reference: string;
  message: string;
  data?: {
    authorizationUrl?: string;
    accessCode?: string;
  };
};

/**
 * Initialize payment with Paystack
 */
export async function initializePaystackPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const amount = Math.floor(request.amount * 100); // Convert to kobo

    const response = await fetch(`${PAYMENT_CONFIG.paystack.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYMENT_CONFIG.paystack.publicKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: request.email,
        amount,
        metadata: {
          full_name: request.fullName,
          user_id: request.userId,
          service_id: request.serviceId || null,
        },
      }),
    });

    const data = (await response.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    };

    if (!data.status) {
      return {
        success: false,
        reference: request.reference,
        message: data.message || "Payment initialization failed",
      };
    }

    return {
      success: true,
      reference: data.data?.reference || request.reference,
      message: "Payment initialized successfully",
      data: {
        authorizationUrl: data.data?.authorization_url,
        accessCode: data.data?.access_code,
      },
    };
  } catch (error) {
    return {
      success: false,
      reference: request.reference,
      message: error instanceof Error ? error.message : "Payment initialization failed",
    };
  }
}

/**
 * Verify payment with Paystack
 */
export async function verifyPaystackPayment(
  reference: string
): Promise<{ success: boolean; message: string; amount?: number }> {
  try {
    const response = await fetch(
      `${PAYMENT_CONFIG.paystack.baseUrl}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYMENT_CONFIG.paystack.publicKey}`,
        },
      }
    );

    const data = (await response.json()) as {
      status: boolean;
      message: string;
      data?: { status: string; amount: number };
    };

    if (!data.status || data.data?.status !== "success") {
      return {
        success: false,
        message: "Payment verification failed",
      };
    }

    return {
      success: true,
      message: "Payment verified successfully",
      amount: data.data?.amount ? data.data.amount / 100 : undefined, // Convert back from kobo
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}

/**
 * Initialize payment with Flutterwave (placeholder)
 */
export async function initializeFlutterwavePayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${PAYMENT_CONFIG.flutterwave.baseUrl}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYMENT_CONFIG.flutterwave.publicKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: "NGN",
        customer: {
          email: request.email,
          name: request.fullName,
        },
        customizations: {
          title: "Food4Love Service Payment",
          description: `Payment for service`,
        },
        meta: {
          user_id: request.userId,
          service_id: request.serviceId || null,
        },
      }),
    });

    const data = (await response.json()) as {
      status: string;
      message: string;
      data?: { link: string; id: number };
    };

    if (data.status !== "success") {
      return {
        success: false,
        reference: request.reference,
        message: data.message || "Payment initialization failed",
      };
    }

    return {
      success: true,
      reference: data.data?.id?.toString() || request.reference,
      message: "Payment initialized successfully",
      data: {
        authorizationUrl: data.data?.link,
      },
    };
  } catch (error) {
    return {
      success: false,
      reference: request.reference,
      message: error instanceof Error ? error.message : "Payment initialization failed",
    };
  }
}

/**
 * Verify payment with Flutterwave (placeholder)
 */
export async function verifyFlutterwavePayment(
  transactionId: string
): Promise<{ success: boolean; message: string; amount?: number }> {
  try {
    const response = await fetch(
      `${PAYMENT_CONFIG.flutterwave.baseUrl}/transactions/${transactionId}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYMENT_CONFIG.flutterwave.publicKey}`,
        },
      }
    );

    const data = (await response.json()) as {
      status: string;
      message: string;
      data?: { status: string; amount: number };
    };

    if (data.status !== "success" || data.data?.status !== "successful") {
      return {
        success: false,
        message: "Payment verification failed",
      };
    }

    return {
      success: true,
      message: "Payment verified successfully",
      amount: data.data?.amount,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}

/**
 * Get payment provider and methods
 */
export function getPaymentProvider(): PaymentProvider {
  return ACTIVE_PROVIDER;
}

/**
 * Calculate total amount including fees
 */
export function calculatePaymentWithFee(amount: number, provider: PaymentProvider = ACTIVE_PROVIDER): {
  subtotal: number;
  fee: number;
  total: number;
} {
  const feePercent = PAYMENT_CONFIG[provider].fee;
  const fee = Math.round(amount * (feePercent / 100));
  return {
    subtotal: amount,
    fee,
    total: amount + fee,
  };
}
