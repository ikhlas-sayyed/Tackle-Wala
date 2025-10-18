// PrivacyPolicy.jsx
import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy - Tackle Wala</h1>
      <p className="mb-4">
        At <strong>Tackle Wala</strong>, your privacy is our priority. We collect personal information such as name, email, shipping address, and payment details to provide you with a seamless shopping experience. 
      </p>
      <p className="mb-4">
        We do not share your personal information with third parties except for order fulfillment, payment processing, or legal requirements. By using our services, you consent to this privacy policy.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Information Collection</h2>
      <p className="mb-4">
        We collect information when you create an account, place an order, or contact us for support. This includes your email, phone number, and shipping address.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Cookies</h2>
      <p className="mb-4">
        We use cookies to improve user experience, track orders, and analyze website traffic.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p>
        If you have questions about this privacy policy, please contact us at <strong>support@tacklewala.com</strong>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
export const metadata = {
  title: "Privacy Policy - Tackle Wala",
  description: "Read the privacy policy of Tackle Wala to understand how we handle your personal information.",
};