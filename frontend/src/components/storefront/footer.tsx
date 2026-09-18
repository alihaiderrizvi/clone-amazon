'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-sm py-4"
      >
        Back to top
      </button>

      {/* Main Footer Links */}
      <div className="bg-[#232F3E] text-white">
        <div className="max-w-[1500px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Get to Know Us */}
            <div>
              <h3 className="font-bold mb-3">Get to Know Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:underline">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    About Amazon Clone
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Investor Relations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Make Money with Us */}
            <div>
              <h3 className="font-bold mb-3">Make Money with Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/seller" className="hover:underline">
                    Sell products on Amazon Clone
                  </Link>
                </li>
                <li>
                  <Link href="/seller/ads" className="hover:underline">
                    Advertise Your Products
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Become an Affiliate
                  </Link>
                </li>
              </ul>
            </div>

            {/* Payment Products */}
            <div>
              <h3 className="font-bold mb-3">Payment Products</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:underline">
                    Shop with Points
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Reload Your Balance
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Currency Converter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Let Us Help You */}
            <div>
              <h3 className="font-bold mb-3">Let Us Help You</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/orders" className="hover:underline">
                    Your Orders
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Shipping Rates & Policies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Returns & Replacements
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Help
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#131A22] text-white">
        <div className="max-w-[1500px] mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-4">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold">
              amazon<span className="text-[#FF9900]">.clone</span>
            </Link>

            {/* Copyright */}
            <p className="text-xs text-gray-400">
              © {currentYear} Amazon Clone, Inc. This is a demo project for educational
              purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
