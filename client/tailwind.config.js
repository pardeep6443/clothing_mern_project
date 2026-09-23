// /** @type {import('tailwindcss').Config} */
// export default {
//     darkMode: ["class"],
//     content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
// 	prefix: "",
//   theme: {
//   	extend: {
//   		borderRadius: {
//   			lg: 'var(--radius)',
//   			md: 'calc(var(--radius) - 2px)',
//   			sm: 'calc(var(--radius) - 4px)'
//   		},
//   		colors: {
//   			background: 'hsl(var(--background))',
//   			foreground: 'hsl(var(--foreground))',
//   			card: {
//   				DEFAULT: 'hsl(var(--card))',
//   				foreground: 'hsl(var(--card-foreground))'
//   			},
//   			popover: {
//   				DEFAULT: 'hsl(var(--popover))',
//   				foreground: 'hsl(var(--popover-foreground))'
//   			},
//   			primary: {
//   				DEFAULT: 'hsl(var(--primary))',
//   				foreground: 'hsl(var(--primary-foreground))'
//   			},
//   			secondary: {
//   				DEFAULT: 'hsl(var(--secondary))',
//   				foreground: 'hsl(var(--secondary-foreground))'
//   			},
//   			muted: {
//   				DEFAULT: 'hsl(var(--muted))',
//   				foreground: 'hsl(var(--muted-foreground))'
//   			},
//   			accent: {
//   				DEFAULT: 'hsl(var(--accent))',
//   				foreground: 'hsl(var(--accent-foreground))'
//   			},
//   			destructive: {
//   				DEFAULT: 'hsl(var(--destructive))',
//   				foreground: 'hsl(var(--destructive-foreground))'
//   			},
//   			border: 'hsl(var(--border))',
//   			input: 'hsl(var(--input))',
//   			ring: 'hsl(var(--ring))',
//   			chart: {
//   				'1': 'hsl(var(--chart-1))',
//   				'2': 'hsl(var(--chart-2))',
//   				'3': 'hsl(var(--chart-3))',
//   				'4': 'hsl(var(--chart-4))',
//   				'5': 'hsl(var(--chart-5))'
//   			}
//   		}
//   	}
//   },
//   plugins: [require("tailwindcss-animate")],
// }


/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './index.html',
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        literature: ['"Cormorant Garamond"', '"EB Garamond"', 'Newsreader', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"EB Garamond"', 'Cinzel', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', '"EB Garamond"', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        sans: ['Montserrat', '"Plus Jakarta Sans"', '-apple-system', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        'dior': '0.22em',
        'couture': '0.3em',
      },
      colors: {
        dior: {
          black: "#111111",
          pureBlack: "#000000",
          charcoal: "#1C1C1C",
          white: "#FFFFFF",
          alabaster: "#FBFBFB",
          stone: "#F5F5F5",
          sand: "#F0EFEB",
          border: "#E5E5E5",
          subtleBorder: "#EFEFEF",
          gold: "#C5A880",
          goldDark: "#A68A64",
          muted: "#767676",
          lightMuted: "#999999",
        },
        gunmetal: {
          DEFAULT: "#FFFFFF",
          deep: "#FBFBFB",
          card: "#FFFFFF",
          subtle: "#F5F5F5",
          border: "#E5E5E5",
          light: "#767676",
        },
        moonstone: {
          DEFAULT: "#111111",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#111111",
          600: "#000000",
          700: "#000000",
          800: "#000000",
          900: "#000000",
        },
        champagne: {
          DEFAULT: "#111111",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#111111",
          300: "#111111",
          400: "#222222",
          500: "#C5A880",
          600: "#A68A64",
          700: "#8C7355",
        },
        sinopia: {
          DEFAULT: "#111111",
          50: "#FAFAFA",
          100: "#F5F5F5",
          500: "#111111",
          600: "#000000",
          700: "#000000",
        },
        vanilla: {
          DEFAULT: "#111111",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#111111",
          300: "#111111",
          400: "#222222",
        },
        caribbean: {
          DEFAULT: "#111111",
          50: "#FAFAFA",
          100: "#F5F5F5",
          500: "#111111",
          600: "#000000",
          700: "#000000",
          800: "#000000",
        },
        asphalt: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          subtle: "#F5F5F5",
          border: "#E5E5E5",
          light: "#767676",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#111111",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F5",
          foreground: "#111111",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#767676",
        },
        accent: {
          DEFAULT: "#F5F5F5",
          foreground: "#111111",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#111111",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111111",
        },
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 35s linear infinite",
        shimmer: "shimmer 2.5s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}