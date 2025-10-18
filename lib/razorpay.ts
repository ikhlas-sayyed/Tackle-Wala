import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const RazorpayService = {
  async createOrder({ orderId, amount }: { orderId: string; amount: number }) {
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: orderId,
    };

    const order = await razorpay.orders.create(options);
    return order;
  },

  verifySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest("hex");
    return expectedSign === razorpay_signature;
  },
};
