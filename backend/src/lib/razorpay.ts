import crypto from "node:crypto";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export function getRazorpayClient() {
  if (!keyId || !keySecret) {
    throw new Error("Razorpay server keys are not configured.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

export function getRazorpayPublicKey() {
  return process.env.PUBLIC_RAZORPAY_KEY_ID ?? process.env.VITE_RAZORPAY_KEY_ID ?? keyId ?? "";
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  if (!keySecret) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
  return expected === signature;
}
