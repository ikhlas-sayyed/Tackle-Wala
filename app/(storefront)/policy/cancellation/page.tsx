// CancellationPolicy.jsx
import React from "react";

const CancellationPolicy = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Cancellation Policy - Tackle Wala</h1>
      <p className="mb-4">
        Customers can request cancellation of an order on the <strong>same day</strong> the order is placed. After that, cancellations cannot be processed once the order is prepared or shipped.
      </p>
      <p className="mb-4">
        To request a cancellation, contact our support team immediately at <strong>support@tacklewala.com</strong> with your order ID.
      </p>
      <p>
        Refunds for cancelled orders will be processed within 5-7 business days through the original payment method.
      </p>
    </div>
  );
};

export default CancellationPolicy;
export const metadata = {
  title: "Cancellation Policy - Tackle Wala",
  description: "Read the cancellation policy of Tackle Wala regarding order cancellations and refunds.",
};