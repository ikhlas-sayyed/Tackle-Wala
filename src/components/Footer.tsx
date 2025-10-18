import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Tackle Wala</h3>
            <p className="text-gray-400 text-sm">
              Your one-stop destination for premium fishing tackle and equipment.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-white">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/policy/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/policy/terms" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link href="/policy/cancellation" className="hover:text-white">Cancellation Policy</Link></li>
              <li><Link href="/policy/returns" className="hover:text-white">Returns Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/profile" className="hover:text-white">My Account</Link></li>
              <li><Link href="/orders" className="hover:text-white">Order History</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Tackle Wala. All rights reserved.</p>
          <p>Support: <a href="mailto:support@tacklewala.com" className="hover:text-white">support@tacklewala.com</a></p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;