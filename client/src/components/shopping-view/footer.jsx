import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import FooterBrandWatermark from "./footer-brand-watermark";

export default function ShoppingFooter() {
  return (
    <footer className="w-full bg-[#FAF9F6] dark:bg-[#0D0D10] border-t border-[#E5E5E5] dark:border-[#27272A] text-[#111111] dark:text-[#EDEDED] pt-20 pb-12 px-4 sm:px-12 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#E5E5E5] dark:border-[#27272A]">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/shop/home" className="inline-block" aria-label="Daylight Home">
              <span className="font-literature text-2xl tracking-[0.25em] text-[#111111] dark:text-[#EDEDED] font-normal">
                DAYLIGHT
              </span>
            </Link>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#767676] dark:text-[#A1A1AA]">
              HAUTE COUTURE & READY-TO-WEAR
            </p>
            <p className="text-xs text-[#666666] dark:text-[#A1A1AA] font-serif italic max-w-sm leading-relaxed">
              At the intersection of architectural discipline and distressed haute couture. Crafted for modern connoisseurs worldwide.
            </p>
            <div className="pt-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#111111] dark:text-[#EDEDED] border border-[#111111] dark:border-[#52525B] px-3 py-1 inline-block">
                BOUTIQUE CLIENT SERVICE
              </span>
            </div>
          </div>

          {/* Navigation Universe Col */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#111111] dark:text-[#EDEDED] font-medium">
              THE COLLECTIONS
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-[#666666] dark:text-[#A1A1AA]">
              <li>
                <Link to="/shop/listing" className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase">
                  All Creations
                </Link>
              </li>
              <li>
                <Link to="/shop/listing?category=women" className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase">
                  Women's Universe
                </Link>
              </li>
              <li>
                <Link to="/shop/listing?category=men" className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase">
                  Men's Universe
                </Link>
              </li>
              <li>
                <Link to="/shop/listing?category=accessories" className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase">
                  Bags & Leather Goods
                </Link>
              </li>
              <li>
                <Link to="/shop/listing?category=footwear" className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase">
                  Shoes & Footwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Maison & Services Col */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#111111] dark:text-[#EDEDED] font-medium">
              MAISON SERVICES
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-[#666666] dark:text-[#A1A1AA]">
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer">
                Complimentary Shipping & Returns
              </li>
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer">
                Bespoke Atelier Appointments
              </li>
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer">
                Art of Gifting & Packaging
              </li>
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer">
                Certificate of Authenticity
              </li>
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer">
                Sustainability & Savoir-Faire
              </li>
            </ul>
          </div>

          {/* Social / Contact Col */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#111111] dark:text-[#EDEDED] font-medium">
              FOLLOW US
            </h4>
            <ul className="space-y-2 text-xs font-sans text-[#666666] dark:text-[#A1A1AA]">
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer flex items-center justify-between">
                <span>INSTAGRAM</span>
                <ArrowUpRight className="w-3 h-3" />
              </li>
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer flex items-center justify-between">
                <span>PINTEREST</span>
                <ArrowUpRight className="w-3 h-3" />
              </li>
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer flex items-center justify-between">
                <span>YOUTUBE</span>
                <ArrowUpRight className="w-3 h-3" />
              </li>
              <li className="hover:text-[#111111] dark:hover:text-white transition-colors tracking-wider uppercase cursor-pointer flex items-center justify-between">
                <span>WECHAT</span>
                <ArrowUpRight className="w-3 h-3" />
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive Kinetic Brand Wordmark (DAYLIGHT <-> NIGHTFALL) */}
        <div className="pt-8 pb-4">
          <FooterBrandWatermark />
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#27272A] flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans tracking-[0.15em] text-[#767676] dark:text-[#A1A1AA] gap-4 uppercase">
          <div className="flex items-center gap-3">
            <span>© 2026 DAYLIGHT MAISON</span>
            <span>•</span>
            <span>PARIS • TOKYO • NEW YORK</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-[#111111] dark:hover:text-white cursor-pointer transition-colors">LEGAL TERMS</span>
            <span className="hover:text-[#111111] dark:hover:text-white cursor-pointer transition-colors">PRIVACY POLICY</span>
            <span className="hover:text-[#111111] dark:hover:text-white cursor-pointer transition-colors">INTERNATIONAL / ENGLISH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
