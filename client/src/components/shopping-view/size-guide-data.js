// H&M Architectural Sizing Data & Garment Classification Engine

export const TOPWEAR_SIZE_DATA = {
  type: "top",
  categoryTitle: "SIZE GUIDE - TOPS, SHIRTS, JACKETS, BLAZERS ETC.",
  categoryLabel: "Tops, Shirts, Hoodies & Jackets",
  fitType: "REGULAR",
  ranges: [
    { id: "S-M", label: "S-M", sizes: ["S", "M"] },
    { id: "L-XL", label: "L-XL", sizes: ["L", "XL"] },
    { id: "XXL", label: "XXL", sizes: ["XXL"] },
    { id: "ALL", label: "S - XXL", sizes: ["S", "M", "L", "XL", "XXL"] },
  ],
  sizes: ["S", "M", "L", "XL", "XXL"],
  metrics: [
    {
      label: "UK",
      values: {
        XS: "30R-32R",
        S: "34R-36R",
        M: "38R-40R",
        L: "42R-44R",
        XL: "46R-48R",
        XXL: "50R-52R",
      },
    },
    {
      label: "EUR",
      values: {
        XS: "40-42",
        S: "44-46",
        M: "48-50",
        L: "52-54",
        XL: "56-58",
        XXL: "60-62",
      },
    },
    {
      label: "Chest cm",
      values: {
        XS: "78-86",
        S: "86-94",
        M: "94-102",
        L: "102-110",
        XL: "110-118",
        XXL: "118-126",
      },
    },
    {
      label: "Chest inch",
      values: {
        XS: "30¾-33¾",
        S: "33¾-37",
        M: "37-40¼",
        L: "40¼-43¼",
        XL: "43¼-46½",
        XXL: "46½-49½",
      },
    },
    {
      label: "Waist cm",
      values: {
        XS: "66-74",
        S: "74-82",
        M: "82-90",
        L: "90-98",
        XL: "98-106",
        XXL: "106-115",
      },
    },
    {
      label: "Waist inch",
      values: {
        XS: "26-29¼",
        S: "29¼-32¼",
        M: "32¼-35½",
        L: "35½-38½",
        XL: "38½-41¾",
        XXL: "41¾-45¼",
      },
    },
    {
      label: "Arm length cm",
      values: {
        XS: "59",
        S: "60-61",
        M: "62-63",
        L: "64-65",
        XL: "65-66",
        XXL: "66-67",
      },
    },
  ],
  howToMeasure: [
    {
      number: "1",
      title: "CHEST",
      desc: "Measure your chest over the fullest part.",
    },
    {
      number: "2",
      title: "WAIST",
      desc: "Measure your waist at the narrowest point.",
    },
    {
      number: "3",
      title: "ARM LENGTH",
      desc: "Measure from your shoulder point to your wrist.",
    },
    {
      number: "4",
      title: "NECKLINE",
      desc: "To find the perfect size on shirts when using ties/bows - Measure your neck, the collar needs to fit properly.",
    },
  ],
};

export const BOTTOMWEAR_SIZE_DATA = {
  type: "bottom",
  categoryTitle: "SIZE GUIDE - TROUSERS, JEANS, SHORTS ETC.",
  categoryLabel: "Trousers, Jeans, Shorts & Bottoms",
  fitType: "REGULAR",
  ranges: [
    { id: "S-M", label: "S-M", sizes: ["S", "M"] },
    { id: "L-XL", label: "L-XL", sizes: ["L", "XL"] },
    { id: "XXL", label: "XXL", sizes: ["XXL"] },
    { id: "ALL", label: "S - XXL", sizes: ["S", "M", "L", "XL", "XXL"] },
  ],
  sizes: ["S", "M", "L", "XL", "XXL"],
  metrics: [
    {
      label: "UK / US Waist",
      values: {
        XS: "28-29",
        S: "30-31",
        M: "32-33",
        L: "34-36",
        XL: "38-40",
        XXL: "42-44",
      },
    },
    {
      label: "EUR",
      values: {
        XS: "44",
        S: "46-48",
        M: "48-50",
        L: "50-52",
        XL: "54-56",
        XXL: "58-60",
      },
    },
    {
      label: "Waist cm",
      values: {
        XS: "71-75",
        S: "76-81",
        M: "82-87",
        L: "88-93",
        XL: "94-101",
        XXL: "102-109",
      },
    },
    {
      label: "Waist inch",
      values: {
        XS: "28-29½",
        S: "30-32",
        M: "32¼-34¼",
        L: "34½-36½",
        XL: "37-39¾",
        XXL: "40-43",
      },
    },
    {
      label: "Hip / Seat cm",
      values: {
        XS: "86-91",
        S: "92-97",
        M: "98-103",
        L: "104-109",
        XL: "110-117",
        XXL: "118-125",
      },
    },
    {
      label: "Hip / Seat inch",
      values: {
        XS: "34-36",
        S: "36¼-38¼",
        M: "38½-40½",
        L: "41-43",
        XL: "43¼-46",
        XXL: "46½-49¼",
      },
    },
    {
      label: "Inside leg cm",
      values: {
        XS: "80",
        S: "81",
        M: "82",
        L: "82",
        XL: "83",
        XXL: "83",
      },
    },
    {
      label: "Inside leg inch",
      values: {
        XS: "31½",
        S: "32",
        M: "32¼",
        L: "32¼",
        XL: "32¾",
        XXL: "32¾",
      },
    },
  ],
  howToMeasure: [
    {
      number: "1",
      title: "WAIST",
      desc: "Measure around your natural waistline, keeping the tape comfortably loose.",
    },
    {
      number: "2",
      title: "HIP",
      desc: "Measure around the fullest part of your hips and seat.",
    },
    {
      number: "3",
      title: "INSIDE LEG",
      desc: "Measure from the top of your inside leg (crotch) down to the floor.",
    },
    {
      number: "4",
      title: "THIGH",
      desc: "Measure around the fullest part of your thigh.",
    },
  ],
};

/**
 * Accurately determines if a product is Bottomwear (Jeans, Trousers, Shorts, Joggers)
 * or Topwear (Tops, Shirts, Hoodies, Jackets, etc.)
 */
export function detectProductGarmentType(product) {
  if (!product) return "top";

  const title = (product.title || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const cat =
    typeof product.category === "string"
      ? product.category.toLowerCase()
      : Array.isArray(product.categories)
      ? product.categories.join(" ").toLowerCase()
      : "";

  const bottomKeywords = [
    "jean",
    "jeans",
    "pant",
    "pants",
    "trouser",
    "trousers",
    "short",
    "shorts",
    "jogger",
    "joggers",
    "sweatpant",
    "sweatpants",
    "chinos",
    "chino",
    "cargo",
    "cargos",
    "bottom",
    "bottoms",
    "bottomwear",
    "skirt",
    "legging",
    "leggings",
    "denim pant",
  ];

  for (const kw of bottomKeywords) {
    const reg = new RegExp(`\\b${kw}\\b`, "i");
    if (reg.test(title) || reg.test(cat) || reg.test(desc)) {
      return "bottom";
    }
  }

  return "top";
}
