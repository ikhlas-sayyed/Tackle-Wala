// app/page.jsx (or app/home/page.jsx)
import { Home } from '../src/pages/storefront/Home';
import { Navbar } from '../src/components/Navbar';
import { Footer } from '../src/components/Footer';

// Metadata for SEO & social sharing
export const metadata = {
  title: "Tackle Wala - Premium Fishing Tackle & Equipment",
  description: "Shop premium fishing tackle, rods, reels, lures, and accessories at Tackle Wala.",
  icons: "/favicon.ico",
  keywords: ["Tackle Wala", "fishing tackle", "fishing equipment", "rods", "reels", "lures"],
  authors: [{ name: "Tackle Wala" }],
  openGraph: {
    title: "Tackle Wala - Premium Fishing Tackle & Equipment",
    description: "Shop rods, reels, lures, and more for your next fishing adventure.",
    url: "https://www.tacklewala.com",
    type: "website",
    images: [
      {
        url: "https://www.tacklewala.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tackle Wala"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tackle Wala - Premium Fishing Tackle & Equipment",
    description: "Shop rods, reels, lures, and more for your next fishing adventure.",
    images: ["https://www.tacklewala.com/og-image.jpg"],
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  );
}
