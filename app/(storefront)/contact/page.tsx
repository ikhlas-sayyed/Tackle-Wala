export const metadata = {
  title: "Contact Us | Tackle Wala",
  description:
    "Get in touch with Tackle Wala for inquiries, support, or fishing equipment assistance.",
};

export default function ContactPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-16">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Contact Us
        </h1>
        <p className="text-gray-600 mb-8">
          Have a question or need help with your order? We’d love to hear from
          you.
        </p>

        <div className="space-y-6 text-lg text-gray-700">
          <div>
            <h2 className="font-semibold text-xl text-gray-900"> Address</h2>
            <p className="text-gray-600 mt-2">
              123 Marine Street, Mumbai, Maharashtra, India
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-xl text-gray-900"> Phone</h2>
            <p className="text-gray-600 mt-2">+91 98765 43210</p>
          </div>

          <div>
            <h2 className="font-semibold text-xl text-gray-900"> Email</h2>
            <p className="text-gray-600 mt-2">support@tacklewala.com</p>
          </div>
        </div>

        <p className="mt-10 text-sm text-gray-500">
          Available Monday to Saturday, 9:00 AM – 6:00 PM
        </p>
      </div>
    </section>
  );
}
