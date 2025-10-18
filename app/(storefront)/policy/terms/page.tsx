const TermsAndConditions = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Terms and Conditions - Tackle Wala</h1>
      <p className="mb-4">
        By accessing or using <strong>Tackle Wala</strong>, you agree to comply with our terms and conditions. Please read them carefully before making any purchases.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Orders</h2>
      <p className="mb-4">
        All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for reasons including product unavailability, errors, or suspected fraud.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Pricing</h2>
      <p className="mb-4">
        Prices are subject to change without notice. All prices listed are in INR and inclusive of applicable taxes unless otherwise stated.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Use of Website</h2>
      <p className="mb-4">
        Users must use our website lawfully and not engage in any activity that may damage the website or compromise user data.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p>
        For questions about these terms, email us at <strong>support@tacklewala.com</strong>.
      </p>
    </div>
  );
};

export default TermsAndConditions;
export const metadata = {
  title: "Terms and Conditions - Tackle Wala",
  description: "Read the terms and conditions of Tackle Wala before using our services.",
};