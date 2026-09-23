import { Outlet, Link } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left luxury brand showcase banner */}
      <div className="hidden lg:flex flex-col justify-between bg-[#111111] text-white w-1/2 p-16 relative overflow-hidden">
        {/* Subtle ambient luxury grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10">
          <Link to="/shop/home" className="inline-block" aria-label="Daylight Home">
            <span className="font-literature text-2xl font-normal tracking-[0.22em] text-white hover:opacity-80 transition-opacity">
              DAYLIGHT
            </span>
          </Link>
          <p className="font-sans text-[10px] tracking-[0.3em] text-[#8E8E93] uppercase mt-1">
            Haute Couture • Paris
          </p>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <span className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] font-sans uppercase tracking-[0.25em]">
            Client Portal
          </span>
          <h1 className="font-cinzel text-3xl xl:text-4xl font-light tracking-wide text-white leading-tight">
            Step Into the World of Exceptional Craftsmanship
          </h1>
          <p className="font-sans text-xs text-gray-300 font-light leading-relaxed tracking-wider">
            Sign in to access curated runway arrivals, bespoke orders, private collections, and personalized wardrobe concierge services.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/15 flex items-center justify-between text-[11px] font-sans tracking-widest text-[#8E8E93] uppercase">
          <span>© DAYLIGHT MAISON</span>
          <Link to="/shop/home" className="text-white hover:underline">
            Back to Boutique →
          </Link>
        </div>
      </div>

      {/* Right authentication form container */}
      <div className="flex flex-1 flex-col justify-center items-center bg-white px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/shop/home" className="inline-block" aria-label="Daylight Home">
              <span className="font-literature text-2xl font-normal tracking-[0.22em] text-[#111111]">
                DAYLIGHT
              </span>
            </Link>
            <p className="font-sans text-[10px] tracking-[0.25em] text-[#767676] uppercase mt-1">
              Haute Couture
            </p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;