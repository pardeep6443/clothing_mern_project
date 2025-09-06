import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="/src/assets/img4.jpg"
          alt="Bold streetwear fashion"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex items-center min-h-screen py-16 sm:py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-4xl sm:text-5xl lg:text-7xl font-grotesk font-black text-white leading-tight"
                >
                  BOLD
                  <br />
                  <span className="text-fuchsia-950">FASHION</span>
                  <br />
                  STATEMENTS
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-lg sm:text-xl text-gray-200 max-w-2xl leading-relaxed"
                >
                  Express yourself through bold, modern streetwear that breaks the mold. 
                  Discover pieces that make every outfit a statement.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-brand-accent hover:bg-brand-accent/90 text-gray-100 font-medium px-8 py-6 text-lg group"
                >
                  <Link href="/collections/new">
                    Shop New Arrivals
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="border-white bg-black text-white hover:bg-white hover:text-black font-medium px-8 py-6 text-lg"
                >
                   <a href="/shop/listing" className="block">
                    Browse Collections
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-4 sm:left-6 lg:left-8"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex flex-col items-center text-white/70"
              >
                <span className="text-sm font-medium mb-2 rotate-90 origin-center">SCROLL</span>
                <div className="w-px h-12 bg-gradient-to-b from-white/70 to-transparent" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}