export interface SizeOption {
  size: string;
  price: number;
}

export interface LocalMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  spiceLevel: string; // Used for Fabric details in Vestra
  servingSize: string; // Used for Garment Fit in Vestra
  prepTime: number; // Used for shipping lead time in Vestra
  rating: number;
  image: string;
  categorySlug: string;
  sizes: SizeOption[];
}

export interface LocalCategory {
  name: string;
  slug: string;
  ur: string;
}

export const LOCAL_CATEGORIES: LocalCategory[] = [
  { name: 'T-Shirts', slug: 't-shirts', ur: 'ٹی شرٹس' },
  { name: 'Oversized T-Shirts', slug: 'oversized-t-shirts', ur: 'اوور سائزڈ ٹی شرٹس' },
  { name: 'Polo Shirts', slug: 'polo-shirts', ur: 'پولو شرٹس' },
  { name: 'Formal Shirts', slug: 'formal-shirts', ur: 'فارمل شرٹس' },
  { name: 'Casual Shirts', slug: 'casual-shirts', ur: 'کیژول شرٹس' },
  { name: 'Jeans', slug: 'jeans', ur: 'جینز' },
  { name: 'Trousers', slug: 'trousers', ur: 'ٹراؤزر' },
  { name: 'Cargo Pants', slug: 'cargo-pants', ur: 'کارگو پینٹس' },
  { name: 'Hoodies', slug: 'hoodies', ur: 'ہوڈیز' },
  { name: 'Sweatshirts', slug: 'sweatshirts', ur: 'سویٹ شرٹس' },
  { name: 'Jackets', slug: 'jackets', ur: 'جیکٹس' },
  { name: 'Accessories', slug: 'accessories', ur: 'ایکسیسریز' }
];

export const LOCAL_MENU_ITEMS: LocalMenuItem[] = [
  {
    id: "vestra-t1",
    name: "Heavyweight Oversized Tee",
    description: "An architectural essential crafted from custom 280GSM organic combed cotton with structured boxy fit.",
    price: 2450,
    discount: 10,
    spiceLevel: "100% Cotton",
    servingSize: "Oversized Fit",
    prepTime: 3,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
    categorySlug: "oversized-t-shirts",
    sizes: [
      { size: "S", price: 2450 },
      { size: "M", price: 2450 },
      { size: "L", price: 2450 },
      { size: "XL", price: 2450 }
    ]
  },
  {
    id: "vestra-p1",
    name: "Signature Minimalist Polo",
    description: "Fusing relaxed luxury with classic polo heritage. Knitted with high-gauge mercerized long-staple cotton.",
    price: 3800,
    discount: 0,
    spiceLevel: "Mercerized Cotton",
    servingSize: "Relaxed Fit",
    prepTime: 2,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800",
    categorySlug: "polo-shirts",
    sizes: [
      { size: "S", price: 3800 },
      { size: "M", price: 3800 },
      { size: "L", price: 3800 }
    ]
  },
  {
    id: "vestra-j1",
    name: "Selvedge Denim Jeans",
    description: "Raw indigo denim woven on vintage Japanese looms. Straight-cut silhouette designed to wear-in beautifully.",
    price: 8500,
    discount: 15,
    spiceLevel: "Japanese Selvedge",
    servingSize: "Straight Fit",
    prepTime: 3,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
    categorySlug: "jeans",
    sizes: [
      { size: "30", price: 8500 },
      { size: "32", price: 8500 },
      { size: "34", price: 8500 }
    ]
  },
  {
    id: "vestra-h1",
    name: "Heavyweight Loopback Hoodie",
    description: "Featuring a streamlined double-lined hood without drawstrings, knitted in a dense 450GSM loopback cotton fleece.",
    price: 6800,
    discount: 0,
    spiceLevel: "450GSM Cotton",
    servingSize: "Relaxed Fit",
    prepTime: 3,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    categorySlug: "hoodies",
    sizes: [
      { size: "S", price: 6800 },
      { size: "M", price: 6800 },
      { size: "L", price: 6800 }
    ]
  }
];
