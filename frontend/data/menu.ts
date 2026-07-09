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
  spiceLevel: string;
  servingSize: string;
  prepTime: number;
  rating: number;
  image: string;
  categorySlug: string; // matches category navigation
  sizes: SizeOption[];
}

export interface LocalCategory {
  name: string;
  slug: string;
  ur: string;
}

export const LOCAL_CATEGORIES: LocalCategory[] = [
  { name: 'Fast Food', slug: 'fast-food', ur: 'فاسٹ فوڈ' },
  { name: 'Burgers', slug: 'burgers', ur: 'برگر' },
  { name: 'Hot Wings', slug: 'hot-wings', ur: 'ہوٹ ونگز' },
  { name: 'Shawarma', slug: 'shawarma', ur: 'شاورما' },
  { name: 'Rolls', slug: 'paratha-roll', ur: 'رول' },
  { name: 'Snacks', slug: 'snacks', ur: 'سنیکس' },
  { name: 'Pasta', slug: 'pasta-macaroni', ur: 'پاستا' },
  { name: 'Desi Cuisine', slug: 'desi-cuisine', ur: 'روایتی کھانے' },
  { name: 'Karahi', slug: 'karahi', ur: 'کڑاہی' }
];

export const LOCAL_MENU_ITEMS: LocalMenuItem[] = [
  // FAST FOOD
  {
    id: "ff1",
    name: "Chicken Leg Piece",
    description: "Crispy, golden golden-fried legacy chicken leg piece seasoned in rich Pakistani spices.",
    price: 450,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 12,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800",
    categorySlug: "fast-food",
    sizes: [{ size: "Regular", price: 450 }]
  },
  {
    id: "ff2",
    name: "Chicken Chest Piece",
    description: "Premium breast chunk of golden-fried chicken chest portion, crisp exterior and juicy tender interior.",
    price: 520,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 15,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800",
    categorySlug: "fast-food",
    sizes: [{ size: "Regular", price: 520 }]
  },
  // BURGERS
  {
    id: "b1",
    name: "Burger + Fries",
    description: "Sizzling hand-pressed beef patty or chicken patty with lettuce and house sauce, served with salted fries.",
    price: 450,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 12,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    categorySlug: "burgers",
    sizes: [{ size: "Regular", price: 450 }]
  },
  {
    id: "b2",
    name: "Cheeseburger + Fries",
    description: "Gourmet smashed patty layered with melted cheddar cheese slice and premium salted fries.",
    price: 550,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 12,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    categorySlug: "burgers",
    sizes: [{ size: "Regular", price: 550 }]
  },
  // HOT WINGS
  {
    id: "hw1",
    name: "Hot Wings",
    description: "Crispy batter-fried wings tossed in a spicy, fiery house glaze.",
    price: 480,
    discount: 0,
    spiceLevel: "SPICY",
    servingSize: "1-2 Persons",
    prepTime: 10,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800",
    categorySlug: "hot-wings",
    sizes: [
      { size: "6 Pieces", price: 480 },
      { size: "12 Pieces", price: 940 }
    ]
  },
  // SHAWARMA
  {
    id: "sh1",
    name: "Shawarma",
    description: "Slow-roasted chicken shavings wrapped in soft pita bread with garlic mayo and pickles.",
    price: 180,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 8,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1561651823-34fed022540e?auto=format&fit=crop&q=80&w=800",
    categorySlug: "shawarma",
    sizes: [
      { size: "Medium", price: 180 },
      { size: "Large", price: 250 }
    ]
  },
  // ROLLS
  {
    id: "rl1",
    name: "Paratha Roll",
    description: "Tandoori spiced chicken cubes or beef boti rolled inside a crispy paratha with chatni.",
    price: 280,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "1 Person",
    prepTime: 10,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800",
    categorySlug: "paratha-roll",
    sizes: [{ size: "Regular", price: 280 }]
  },
  // SNACKS
  {
    id: "sn1",
    name: "Spring Roll",
    description: "Crisp wrapper containing sauteed vegetables and shredded chicken stuffing.",
    price: 50,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 6,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    categorySlug: "snacks",
    sizes: [{ size: "Small", price: 50 }]
  },
  {
    id: "sn2",
    name: "Samosa",
    description: "Traditional fried pastry with potato and spice stuffing.",
    price: 25,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 5,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    categorySlug: "snacks",
    sizes: [
      { size: "Small", price: 25 },
      { size: "Large", price: 50 }
    ]
  },
  {
    id: "sn3",
    name: "Chicken Samosa",
    description: "Traditional crispy triangular pastry filled with spiced minced chicken.",
    price: 30,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 5,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    categorySlug: "snacks",
    sizes: [
      { size: "Small", price: 30 },
      { size: "Large", price: 70 }
    ]
  },
  {
    id: "sn4",
    name: "Club Sandwich",
    description: "Triple decker toast with grilled chicken breast, egg, lettuce, cheese, and tomatoes.",
    price: 280,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 12,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800",
    categorySlug: "snacks",
    sizes: [{ size: "Regular", price: 280 }]
  },
  // PASTA
  {
    id: "ps1",
    name: "Chicken Macaroni",
    description: "Elbow macaroni tossed with juicy chicken strips and bell peppers in chili garlic sauce.",
    price: 350,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "1 Person",
    prepTime: 15,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
    categorySlug: "pasta-macaroni",
    sizes: [{ size: "Per Head", price: 350 }]
  },
  {
    id: "ps2",
    name: "Beef Macaroni",
    description: "A rich and hearty beef mince stir-fried with macaroni and dynamic veggies.",
    price: 380,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "1 Person",
    prepTime: 15,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
    categorySlug: "pasta-macaroni",
    sizes: [{ size: "Per Head", price: 380 }]
  },
  {
    id: "ps3",
    name: "Spaghetti",
    description: "Classic long pasta strings served with savory chicken tomato sauce.",
    price: 380,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 15,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
    categorySlug: "pasta-macaroni",
    sizes: [{ size: "Per Head", price: 380 }]
  },
  {
    id: "ps4",
    name: "Alfredo Pasta",
    description: "Rich creamy white cheese sauce with fettuccine pasta and grilled chicken.",
    price: 480,
    discount: 0,
    spiceLevel: "NONE",
    servingSize: "1 Person",
    prepTime: 15,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
    categorySlug: "pasta-macaroni",
    sizes: [{ size: "Per Head", price: 480 }]
  },
  // DESI CUISINE
  {
    id: "ds1",
    name: "Dal Chawal",
    description: "Basmati rice served with yellow cooked dal tadka and local pickle salad.",
    price: 300,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 8,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800",
    categorySlug: "desi-cuisine",
    sizes: [{ size: "Per Plate", price: 300 }]
  },
  {
    id: "ds2",
    name: "Chicken Biryani",
    description: "Authentic spiced Karachi style layered basmati rice with juicy chicken pieces and potato.",
    price: 500,
    discount: 0,
    spiceLevel: "SPICY",
    servingSize: "1-3 Persons",
    prepTime: 15,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800",
    categorySlug: "desi-cuisine",
    sizes: [
      { size: "Half KG", price: 500 },
      { size: "1 KG", price: 1000 }
    ]
  },
  {
    id: "ds3",
    name: "Chicken Pulao",
    description: "Aromatic basmati pulao rice cooked with chicken stock and local cardamoms.",
    price: 450,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "1-3 Persons",
    prepTime: 15,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800",
    categorySlug: "desi-cuisine",
    sizes: [
      { size: "Half KG", price: 450 },
      { size: "1 KG", price: 900 }
    ]
  },
  {
    id: "ds4",
    name: "Haleem",
    description: "Slow-cooked mutton, wheat, lentils, and local spices, garnished with fried onions, ginger, and lemon.",
    price: 250,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "1 Person",
    prepTime: 10,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    categorySlug: "desi-cuisine",
    sizes: [{ size: "Per Head", price: 250 }]
  },
  {
    id: "ds5",
    name: "Saag",
    description: "Traditional Punjabi style mustard greens cooked in desi ghee and spices.",
    price: 250,
    discount: 0,
    spiceLevel: "MILD",
    servingSize: "1 Person",
    prepTime: 10,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    categorySlug: "desi-cuisine",
    sizes: [{ size: "Per Head", price: 250 }]
  },
  {
    id: "ds6",
    name: "Curry Pakora",
    description: "A tangy yogurt-based gram flour curry with crispy vegetable fritters (pakoras) submerged inside.",
    price: 280,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "1 Person",
    prepTime: 10,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    categorySlug: "desi-cuisine",
    sizes: [{ size: "Per Head", price: 280 }]
  },
  // KARAHI
  {
    id: "kr1",
    name: "White Chicken Karahi",
    description: "Creamy white karahi cooked with green chilies, yogurt, cream, and ginger.",
    price: 900,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "2-4 Persons",
    prepTime: 25,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    categorySlug: "karahi",
    sizes: [
      { size: "Half KG", price: 900 },
      { size: "1 KG", price: 1700 }
    ]
  },
  {
    id: "kr2",
    name: "Chicken Karahi",
    description: "Karachi specialty karahi cooked with tomatoes, green chilies, and black peppers.",
    price: 800,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "2-4 Persons",
    prepTime: 25,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    categorySlug: "karahi",
    sizes: [
      { size: "Half KG", price: 800 },
      { size: "1 KG", price: 1550 }
    ]
  },
  {
    id: "kr3",
    name: "Mutton Karahi",
    description: "Luxury mutton stir-fried in a traditional wok with fresh tomatoes, ginger, and desi ghee.",
    price: 1350,
    discount: 0,
    spiceLevel: "MEDIUM",
    servingSize: "2-4 Persons",
    prepTime: 30,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    categorySlug: "karahi",
    sizes: [
      { size: "Half KG", price: 1350 },
      { size: "1 KG", price: 2650 }
    ]
  }
];
