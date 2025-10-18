// ReturnsPolicy.jsx
import React from "react";

const ReturnsPolicy = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Returns & Refunds Policy - Tackle Wala</h1>
      <p className="mb-4">
        At <strong>Tackle Wala</strong>, we do not accept returns unless the product is defective or damaged during shipping. 
      </p>
      <h2 className="text-2xl font-semibold mb-2">Defective Products</h2>
      <p className="mb-4">
        If you receive a defective product, contact us within 3 days of delivery at <strong>support@tacklewala.com</strong>. We will guide you through the return process and provide a replacement or refund.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Non-Returnable Items</h2>
      <p className="mb-4">
        All other items are non-returnable, including fishing tackle, accessories, and consumables, unless found defective.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Refund Process</h2>
      <p>
        Refunds, when applicable, will be issued to the original payment method within 5-7 business days after receiving the defective product.
      </p>
    </div>
  );
};

export default ReturnsPolicy;
export const metadata = {
  title: "Returns & Refunds Policy - Tackle Wala",
  description: "Read the returns and refunds policy of Tackle Wala regarding defective products.",
};