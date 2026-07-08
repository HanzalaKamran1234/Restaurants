import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean database
  await prisma.coupon.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Ziyafat Admin',
      email: 'admin@ziyafat.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+923001234567',
      whatsapp: '+923001234567',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Hamza Khan',
      email: 'hamza@gmail.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+923339876543',
      whatsapp: '+923339876543',
      loyaltyPoints: 120,
    },
  });

  // Create Address for customer
  await prisma.address.create({
    data: {
      userId: customer.id,
      area: 'North Nazimabad',
      landmark: 'Near Shipowner College',
      fullAddress: 'House A-102, Block L, North Nazimabad, Karachi',
    },
  });

  // Create Categories
  const fastFood = await prisma.category.create({
    data: {
      name: 'Fast Food',
      slug: 'fast-food',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
    },
  });

  const desiKhany = await prisma.category.create({
    data: {
      name: 'Desi Khany',
      slug: 'desi-khany',
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800',
    },
  });

  // Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'ZIYAFAT10',
        discountPercent: 10,
        maxDiscount: 200,
        expiresAt: new Date('2028-12-31'),
      },
      {
        code: 'WELCOME50',
        discountPercent: 15,
        maxDiscount: 500,
        expiresAt: new Date('2028-12-31'),
      },
      {
        code: 'FEAST25',
        discountPercent: 25,
        maxDiscount: 1000,
        expiresAt: new Date('2028-12-31'),
      },
    ],
  });

  // Menu items - FAST FOOD
  const fastFoodItems = [
    {
      name: 'Ziyafat Royal Beef Burger',
      description: 'Gourmet smashed double beef patties, melted cheddar, caramelized onions, house truffle mayo in a toasted brioche bun.',
      ingredients: 'Double Beef Patty, Cheddar Cheese, Brioche Bun, Truffle Mayo, Caramelized Onions',
      calories: 780,
      spiceLevel: 'MILD',
      servingSize: '1 Person',
      price: 850,
      discount: 10,
      available: true,
      prepTime: 15,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
      categoryId: fastFood.id,
    },
    {
      name: 'Spicy Crunch Chicken Burger',
      description: 'Extra crispy buttermilk fried chicken breast, spicy house glaze, creamy coleslaw, pickles, premium toasted bun.',
      ingredients: 'Fried Crispy Chicken, Spicy Glaze, Coleslaw, Pickles',
      calories: 690,
      spiceLevel: 'SPICY',
      servingSize: '1 Person',
      price: 690,
      discount: 0,
      available: true,
      prepTime: 12,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&q=80&w=800',
      categoryId: fastFood.id,
    },
    {
      name: 'Spicy Buffalo Wings',
      description: '8 pieces of crispy fried wings tossed in our signature tangy buffalo sauce, served with premium blue cheese dip.',
      ingredients: 'Chicken Wings, Buffalo Sauce, Celery, Blue Cheese Dip',
      calories: 520,
      spiceLevel: 'SPICY',
      servingSize: '1-2 Persons',
      price: 490,
      discount: 15,
      available: true,
      prepTime: 10,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=800',
      categoryId: fastFood.id,
    },
    {
      name: 'Premium Arabic Chicken Shawarma',
      description: 'Slow-roasted chicken shavings, garlic toum sauce, pickled cucumbers wrapped in hand-stretched pita bread.',
      ingredients: 'Spiced Chicken, Garlic Toum, Pickles, Lebanese Pita',
      calories: 450,
      spiceLevel: 'MILD',
      servingSize: '1 Person',
      price: 320,
      discount: 0,
      available: true,
      prepTime: 8,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1561651823-34fed022540e?auto=format&fit=crop&q=80&w=800',
      categoryId: fastFood.id,
    },
    {
      name: 'Garlic Mayo Chicken Paratha Roll',
      description: 'Charcoal grilled chicken tikka boti, creamy garlic mayo sauce, and sliced onions wrapped in a flaky golden paratha.',
      ingredients: 'Chicken Boti, Garlic Mayo, Onion, Flaky Paratha',
      calories: 580,
      spiceLevel: 'MEDIUM',
      servingSize: '1 Person',
      price: 290,
      discount: 5,
      available: true,
      prepTime: 10,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=800',
      categoryId: fastFood.id,
    },
    {
      name: 'Creamy Fettuccine Alfredo',
      description: 'Rich and creamy parmesan sauce with sliced grilled chicken breast and fresh mushrooms over fettuccine pasta.',
      ingredients: 'Fettuccine Pasta, Heavy Cream, Parmesan, Grilled Chicken, Mushrooms',
      calories: 820,
      spiceLevel: 'NONE',
      servingSize: '1 Person',
      price: 950,
      discount: 0,
      available: true,
      prepTime: 20,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=800',
      categoryId: fastFood.id,
    },
  ];

  // Menu items - DESI KHANY
  const desiItems = [
    {
      name: 'Special Spicy Chicken Biryani',
      description: 'Karachi style aromatic basmati rice layered with spicy chicken masala, potatoes, saffron, and fresh mint leaves.',
      ingredients: 'Basmati Rice, Marinated Chicken, Saffron, Mint, Spices, Potatoes',
      calories: 650,
      spiceLevel: 'SPICY',
      servingSize: '1 Person',
      price: 390,
      discount: 10,
      available: true,
      prepTime: 15,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800',
      categoryId: desiKhany.id,
    },
    {
      name: 'Desi Ghee Mutton Karahi',
      description: 'Premium mutton cooked in pure desi ghee with tomatoes, green chilies, ginger, and freshly crushed black pepper.',
      ingredients: 'Mutton, Desi Ghee, Tomatoes, Ginger, Green Chilies, Black Pepper',
      calories: 920,
      spiceLevel: 'SPICY',
      servingSize: '2-3 Persons',
      price: 2400,
      discount: 0,
      available: true,
      prepTime: 30,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      categoryId: desiKhany.id,
    },
    {
      name: 'Shahi Mutton Haleem',
      description: 'Slow-cooked stew of barley, wheat, lentils, and shredded mutton, garnished with fried onions, ginger, and lemon.',
      ingredients: 'Mutton, Barley, Wheat, Mixed Lentils, Fried Onions, Chaat Masala',
      calories: 480,
      spiceLevel: 'MEDIUM',
      servingSize: '1 Person',
      price: 380,
      discount: 0,
      available: true,
      prepTime: 10,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
      categoryId: desiKhany.id,
    },
    {
      name: 'Peshawari Chicken Karahi',
      description: 'Bone-in chicken stir-fried with ripe tomatoes, garlic, ginger, and green chilies in a traditional iron wok.',
      ingredients: 'Chicken, Tomatoes, Green Chilies, Ginger, Garlic',
      calories: 710,
      spiceLevel: 'MEDIUM',
      servingSize: '2 Persons',
      price: 1100,
      discount: 10,
      available: true,
      prepTime: 25,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800',
      categoryId: desiKhany.id,
    },
    {
      name: 'Traditional Dal Chawal',
      description: 'Fragrant steamed basmati rice served with a buttery, cumin-tempered split yellow lentil mash, and home-style pickle.',
      ingredients: 'Basmati Rice, Yellow Lentils, Cumin Tarka, Butter, Mango Pickle',
      calories: 380,
      spiceLevel: 'MILD',
      servingSize: '1 Person',
      price: 250,
      discount: 0,
      available: true,
      prepTime: 10,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
      categoryId: desiKhany.id,
    },
  ];

  await prisma.menuItem.createMany({ data: [...fastFoodItems, ...desiItems] });

  // Add a sample review
  const items = await prisma.menuItem.findMany();
  if (items.length > 0) {
    await prisma.review.create({
      data: {
        rating: 5,
        comment: 'Absolutely amazing taste! Authentic spices, hot delivery.',
        userId: customer.id,
        menuItemId: items[0].id,
      },
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
