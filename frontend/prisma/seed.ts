import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Supabase PostgreSQL database...');

  // Clean existing tables (careful on order to avoid constraint violations)
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.deliveryArea.deleteMany();
  await prisma.websiteSetting.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.profile.deleteMany();

  console.log('Database cleaned.');

  // 1. Create Delivery Areas
  const northNazimabad = await prisma.deliveryArea.create({
    data: {
      name: 'North Nazimabad',
      deliveryCharge: 150,
      estimatedTime: '30 Mins',
      minOrderAmount: 300,
      available: true,
    },
  });

  // 2. Create Mock Profiles (Clerk IDs will be synced at login, but seeding helps verify UI)
  const adminProfile = await prisma.profile.create({
    data: {
      id: 'mock_admin_123',
      email: 'admin@ziyafat.com',
      fullName: 'Ziyafat Admin',
      role: 'admin',
      phone: '0370349146',
      whatsapp: '+923700349146',
    },
  });

  const customerProfile = await prisma.profile.create({
    data: {
      id: 'mock_customer_123',
      email: 'ali@gmail.com',
      fullName: 'Muhammad Ali',
      role: 'customer',
      phone: '03331234567',
      whatsapp: '03331234567',
    },
  });

  // 3. Saved Address for customer
  await prisma.address.create({
    data: {
      profileId: customerProfile.id,
      title: 'Home',
      areaId: northNazimabad.id,
      landmark: 'Block H near Park',
      fullAddress: 'House B-42, Block H, North Nazimabad, Karachi',
      isDefault: true,
    },
  });

  // 4. Website Settings
  await prisma.websiteSetting.createMany({
    data: [
      { key: 'logo_text', value: 'ضیافت' },
      { key: 'website_status', value: 'OPEN' },
      { key: 'contact_phone', value: '0370349146' },
      { key: 'contact_email', value: 'info@ziyafat.com' },
    ],
  });

  // 5. Create Categories
  const categoriesList = [
    { name: 'Fast Food', slug: 'fast-food', image: 'https://images.unsplash.com/photo-1561751823-34fed022540e?auto=format&fit=crop&q=80&w=800' },
    { name: 'Burgers', slug: 'burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800' },
    { name: 'Hot Wings', slug: 'hot-wings', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800' },
    { name: 'Shawarma', slug: 'shawarma', image: 'https://images.unsplash.com/photo-1561651823-34fed022540e?auto=format&fit=crop&q=80&w=800' },
    { name: 'Paratha Roll', slug: 'paratha-roll', image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Spring Rolls', slug: 'spring-rolls', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' },
    { name: 'Samosa', slug: 'samosa', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800' },
    { name: 'Chicken Samosa', slug: 'chicken-samosa', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800' },
    { name: 'Sandwiches', slug: 'sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800' },
    { name: 'Pasta & Macaroni', slug: 'pasta-macaroni', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800' },
    { name: 'Desi Cuisine', slug: 'desi-cuisine', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800' },
    { name: 'Karahi', slug: 'karahi', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800' }
  ];

  const dbCategories: { [key: string]: string } = {};

  for (const cat of categoriesList) {
    const createdCat = await prisma.category.create({
      data: cat
    });
    dbCategories[cat.slug] = createdCat.id;
  }

  // 6. Menu Items
  const menuItemsList = [
    {
      name: 'Chicken Leg Piece',
      description: 'Crispy, golden-fried chicken leg piece seasoned in rich Pakistani spices.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800',
      price: 450,
      sizes: JSON.stringify([{ size: 'Regular', price: 450 }]),
      prepTime: 12,
      categoryId: dbCategories['fast-food'],
      servingSize: '1 Person',
      ingredients: 'Chicken leg, local herbs, spices, premium batter'
    },
    {
      name: 'Chicken Chest Piece',
      description: 'Premium breast chunk of golden-fried chicken chest portion, crisp exterior and juicy tender interior.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800',
      price: 520,
      sizes: JSON.stringify([{ size: 'Regular', price: 520 }]),
      prepTime: 15,
      categoryId: dbCategories['fast-food'],
      servingSize: '1 Person',
      ingredients: 'Chicken chest, local spices, premium oil'
    },
    {
      name: 'Burger + Fries',
      description: 'Sizzling hand-pressed beef patty or chicken patty with lettuce and house sauce, served with salted fries.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
      price: 450,
      sizes: JSON.stringify([{ size: 'Regular', price: 450 }]),
      prepTime: 12,
      categoryId: dbCategories['burgers'],
      servingSize: '1 Person',
      ingredients: 'Beef patty, lettuce, cheese, brioche, salt, potato'
    },
    {
      name: 'Cheeseburger + Fries',
      description: 'Gourmet smashed patty layered with melted cheddar cheese slice and premium salted fries.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
      price: 550,
      sizes: JSON.stringify([{ size: 'Regular', price: 550 }]),
      prepTime: 12,
      categoryId: dbCategories['burgers'],
      servingSize: '1 Person',
      ingredients: 'Smash patty, cheddar slice, brioche bun, French fries'
    },
    {
      name: 'Hot Wings',
      description: 'Crispy batter-fried wings tossed in a spicy, fiery house glaze.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800',
      price: 480,
      sizes: JSON.stringify([
        { size: '6 Pieces', price: 480 },
        { size: '12 Pieces', price: 940 }
      ]),
      prepTime: 10,
      categoryId: dbCategories['hot-wings'],
      servingSize: '1-2 Persons',
      ingredients: 'Chicken wings, hot glaze, spices'
    },
    {
      name: 'Shawarma',
      description: 'Slow-roasted chicken shavings wrapped in soft pita bread with garlic mayo and pickles.',
      image: 'https://images.unsplash.com/photo-1561651823-34fed022540e?auto=format&fit=crop&q=80&w=800',
      price: 180,
      sizes: JSON.stringify([
        { size: 'Medium', price: 180 },
        { size: 'Large', price: 250 }
      ]),
      prepTime: 8,
      categoryId: dbCategories['shawarma'],
      servingSize: '1 Person',
      ingredients: 'Chicken shivs, pita bread, garlic mayo, pickled cucumber'
    },
    {
      name: 'Paratha Roll',
      description: 'Tandoori spiced chicken cubes or beef boti rolled inside a crispy paratha with chatni.',
      image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800',
      price: 280,
      sizes: JSON.stringify([{ size: 'Regular', price: 280 }]),
      prepTime: 10,
      categoryId: dbCategories['paratha-roll'],
      servingSize: '1 Person',
      ingredients: 'Chicken boti, crispy paratha, mint chutney, onions'
    },
    {
      name: 'Club Sandwich',
      description: 'Triple decker toast with grilled chicken breast, egg, lettuce, cheese, and tomatoes.',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800',
      price: 280,
      sizes: JSON.stringify([{ size: 'Regular', price: 280 }]),
      prepTime: 12,
      categoryId: dbCategories['sandwiches'],
      servingSize: '1 Person',
      ingredients: 'Bread slice, chicken breast, egg omelette, cheese slice, lettuce'
    },
    {
      name: 'Alfredo Pasta',
      description: 'Rich creamy white cheese sauce with fettuccine pasta and grilled chicken.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
      price: 480,
      sizes: JSON.stringify([{ size: 'Per Head', price: 480 }]),
      prepTime: 15,
      categoryId: dbCategories['pasta-macaroni'],
      servingSize: '1 Person',
      ingredients: 'Fettuccine, heavy cream, parmesan, mushrooms, chicken strips'
    },
    {
      name: 'Chicken Biryani',
      description: 'Authentic spiced Karachi style layered basmati rice with juicy chicken pieces and potato.',
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800',
      price: 500,
      sizes: JSON.stringify([
        { size: 'Half KG', price: 500 },
        { size: '1 KG', price: 1000 }
      ]),
      prepTime: 15,
      categoryId: dbCategories['desi-cuisine'],
      servingSize: '1-3 Persons',
      ingredients: 'Basmati rice, chicken, potato, special biryani masala, saffron'
    },
    {
      name: 'Saag',
      description: 'Saag cooked in pure desi ghee with mustard leaves and authentic herbs.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 250,
      sizes: JSON.stringify([{ size: 'Per Head', price: 250 }]),
      prepTime: 10,
      categoryId: dbCategories['desi-cuisine'],
      servingSize: '1 Person',
      ingredients: 'Mustard leaves, spinach, butter, desi ghee'
    },
    {
      name: 'Mutton Karahi',
      description: 'Luxury mutton stir-fried in a traditional wok with fresh tomatoes, ginger, and desi ghee.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 1350,
      sizes: JSON.stringify([
        { size: 'Half KG', price: 1350 },
        { size: '1 KG', price: 2650 }
      ]),
      prepTime: 30,
      categoryId: dbCategories['karahi'],
      servingSize: '2-4 Persons',
      ingredients: 'Mutton chunks, desi ghee, tomatoes, ginger, green chilies'
    }
  ];

  for (const item of menuItemsList) {
    await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        image: item.image,
        price: item.price,
        sizes: item.sizes,
        prepTime: item.prepTime,
        categoryId: item.categoryId,
        servingSize: item.servingSize,
        ingredients: item.ingredients,
        rating: 4.8
      }
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
