import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-black border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="font-grotesk font-black text-xl text-yellow-50">
              BOLD THREADS
            </div>
            <p className="text-sm text-yellow-50 max-w-sm">
              Modern streetwear and fashion that makes a statement. Express yourself boldly.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-white hover:text-yellow-50 transition-colors">
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-white hover:text-yellow-50 transition-colors">
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-white hover:text-yellow-50 transition-colors">
                <Facebook className="w-5 h-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-white hover:text-yellow-50 transition-colors">
                <Youtube className="w-5 h-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider text-yellow-50">Shop</h3>
            <div className="space-y-2">
              <Link href="/collections/new" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                New Arrivals
              </Link>
              <Link href="/collections/tops" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Tops
              </Link>
              <Link href="/collections/bottoms" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Bottoms
              </Link>
              <Link href="/collections/hoodies" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Hoodies
              </Link>
              <Link href="/collections/accessories" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Accessories
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider text-yellow-50">Support</h3>
            <div className="space-y-2">
              <Link href="/contact" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Contact Us
              </Link>
              <Link href="/faq" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                FAQ
              </Link>
              <Link href="/shipping" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Shipping & Returns
              </Link>
              <Link href="/size-guide" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Size Guide
              </Link>
              <Link href="/care" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Care Instructions
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider text-yellow-50">Company</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                About Us
              </Link>
              <Link href="/careers" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Careers
              </Link>
              <Link href="/press" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Press
              </Link>
              <Link href="/privacy" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-white hover:text-yellow-50 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-yellow-50">
            © 2025 Bold Threads. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-white hover:text-yellow-50 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-white hover:text-yellow-50 transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-sm text-white hover:text-yellow-50 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}