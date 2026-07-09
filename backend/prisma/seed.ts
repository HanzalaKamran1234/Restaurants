import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean database
  await prisma.websiteSettings.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.deliveryArea.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned.');

  // Create Delivery Areas
  const northNazimabad = await prisma.deliveryArea.create({
    data: {
      name: 'North Nazimabad',
      deliveryCharge: 150,
      estimatedTime: '30 Mins',
      minOrderAmount: 300,
      available: true,
    },
  });

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

  await prisma.adminUser.create({
    data: {
      username: 'ziyafat_admin',
      email: 'admin@ziyafat.com',
      password: adminPassword,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Muhammad Ali',
      email: 'ali@gmail.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '03331234567',
      whatsapp: '03331234567',
    },
  });

  // Saved Address for customer
  await prisma.customerAddress.create({
    data: {
      userId: customer.id,
      title: 'Home',
      areaId: northNazimabad.id,
      landmark: 'Block H near Park',
      fullAddress: 'House B-42, Block H, North Nazimabad, Karachi',
    },
  });

  // Website Settings
  await prisma.websiteSettings.createMany({
    data: [
      { key: 'logo_text', value: 'ضیافت' },
      { key: 'website_status', value: 'OPEN' },
      { key: 'contact_phone', value: '03001234567' },
      { key: 'contact_email', value: 'info@ziyafat.com' },
    ],
  });

  // 1. Create Categories
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

  // 2. Menu Items definition with sizes list JSON
  const menuItemsList = [
    // FAST FOOD
    {
      name: 'Chicken Leg Piece',
      description: 'Crispy, golden golden-fried legacy chicken leg piece seasoned in rich Pakistani spices.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800',
      price: 450,
      sizes: JSON.stringify([{ size: 'Regular', price: 450 }]),
      prepTime: 12,
      categoryId: dbCategories['fast-food'],
      servingSize: '1 Person'
    },
    {
      name: 'Chicken Chest Piece',
      description: 'Premium breast chunk of golden-fried chicken chest portion, crisp exterior and juicy tender interior.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800',
      price: 520,
      sizes: JSON.stringify([{ size: 'Regular', price: 520 }]),
      prepTime: 15,
      categoryId: dbCategories['fast-food'],
      servingSize: '1 Person'
    },
    // BURGERS
    {
      name: 'Burger + Fries',
      description: 'Sizzling hand-pressed beef patty or chicken patty with lettuce and house sauce, served with salted fries.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
      price: 450,
      sizes: JSON.stringify([{ size: 'Regular', price: 450 }]),
      prepTime: 12,
      categoryId: dbCategories['burgers'],
      servingSize: '1 Person'
    },
    {
      name: 'Cheeseburger + Fries',
      description: 'Gourmet smashed patty layered with melted cheddar cheese slice and premium salted fries.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
      price: 550,
      sizes: JSON.stringify([{ size: 'Regular', price: 550 }]),
      prepTime: 12,
      categoryId: dbCategories['burgers'],
      servingSize: '1 Person'
    },
    // HOT WINGS
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
      servingSize: '1-2 Persons'
    },
    // SHAWARMA
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
      servingSize: '1 Person'
    },
    // PARATHA ROLL
    {
      name: 'Paratha Roll',
      description: 'Tandoori spiced chicken cubes or beef boti rolled inside a crispy paratha with chatni.',
      image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800',
      price: 280,
      sizes: JSON.stringify([{ size: 'Regular', price: 280 }]),
      prepTime: 10,
      categoryId: dbCategories['paratha-roll'],
      servingSize: '1 Person'
    },
    // SPRING ROLLS
    {
      name: 'Spring Roll',
      description: 'Crisp wrapper containing sauted vegetables and shredded chicken stuffing.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
      price: 50,
      sizes: JSON.stringify([{ size: 'Small', price: 50 }]),
      prepTime: 6,
      categoryId: dbCategories['spring-rolls'],
      servingSize: '1 Person'
    },
    // SAMOSA
    {
      name: 'Samosa',
      description: 'Traditional fried pastry with potato and spice stuffing.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 25,
      sizes: JSON.stringify([
        { size: 'Small', price: 25 },
        { size: 'Large', price: 50 }
      ]),
      prepTime: 5,
      categoryId: dbCategories['samosa'],
      servingSize: '1 Person'
    },
    // CHICKEN SAMOSA
    {
      name: 'Chicken Samosa',
      description: 'Traditional crispy triangular pastry filled with spiced minced chicken.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 30,
      sizes: JSON.stringify([
        { size: 'Small', price: 30 },
        { size: 'Large', price: 70 }
      ]),
      prepTime: 5,
      categoryId: dbCategories['chicken-samosa'],
      servingSize: '1 Person'
    },
    // SANDWICHES
    {
      name: 'Club Sandwich',
      description: 'Triple decker toast with grilled chicken breast, egg, lettuce, cheese, and tomatoes.',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800',
      price: 280,
      sizes: JSON.stringify([{ size: 'Regular', price: 280 }]),
      prepTime: 12,
      categoryId: dbCategories['sandwiches'],
      servingSize: '1 Person'
    },
    // PASTA & MACARONI
    {
      name: 'Chicken Macaroni',
      description: 'Elbow macaroni tossed with juicy chicken strips and bell peppers in chili garlic sauce.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
      price: 350,
      sizes: JSON.stringify([{ size: 'Per Head', price: 350 }]),
      prepTime: 15,
      categoryId: dbCategories['pasta-macaroni'],
      servingSize: '1 Person'
    },
    {
      name: 'Beef Macaroni',
      description: 'A rich and hearty beef mince stir-fried with macaroni and dynamic veggies.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
      price: 380,
      sizes: JSON.stringify([{ size: 'Per Head', price: 380 }]),
      prepTime: 15,
      categoryId: dbCategories['pasta-macaroni'],
      servingSize: '1 Person'
    },
    {
      name: 'Spaghetti',
      description: 'Classic long pasta strings served with savory chicken tomato sauce.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
      price: 380,
      sizes: JSON.stringify([{ size: 'Per Head', price: 380 }]),
      prepTime: 15,
      categoryId: dbCategories['pasta-macaroni'],
      servingSize: '1 Person'
    },
    {
      name: 'Alfredo Pasta',
      description: 'Rich creamy white cheese sauce with fettuccine pasta and grilled chicken.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
      price: 480,
      sizes: JSON.stringify([{ size: 'Per Head', price: 480 }]),
      prepTime: 15,
      categoryId: dbCategories['pasta-macaroni'],
      servingSize: '1 Person'
    },
    // DESI CUISINE
    {
      name: 'Dal Chawal',
      description: 'Basmati rice served with yellow cooked dal tadka and local pickle salad.',
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800',
      price: 300,
      sizes: JSON.stringify([{ size: 'Per Plate', price: 300 }]),
      prepTime: 8,
      categoryId: dbCategories['desi-cuisine'],
      servingSize: '1 Person'
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
      servingSize: '1-3 Persons'
    },
    {
      name: 'Chicken Pulao',
      description: 'Aromatic basmati pulao rice cooked with chicken stock and local cardamoms.',
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800',
      price: 450,
      sizes: JSON.stringify([
        { size: 'Half KG', price: 450 },
        { size: '1 KG', price: 900 }
      ]),
      prepTime: 15,
      categoryId: dbCategories['desi-cuisine'],
      servingSize: '1-3 Persons'
    },
    {
      name: 'Haleem',
      description: 'Slow-cooked mutton, wheat, lentils, and local spices, garnished with fried onions, ginger, and lemon.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 250,
      sizes: JSON.stringify([{ size: 'Per Head', price: 250 }]),
      prepTime: 10,
      categoryId: dbCategories['desi-cuisine'],
      servingSize: '1 Person'
    },
    {
      name: 'Saag',
      description: 'Traditional Punjabi style mustard greens cooked in desi ghee and spices.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 250,
      sizes: JSON.stringify([{ size: 'Per Head', price: 250 }]),
      prepTime: 10,
      categoryId: dbCategories['desi-cuisine'],
      servingSize: '1 Person'
    },
    {
      name: 'Curry Pakora',
      description: 'A tangy yogurt-based gram flour curry with crispy vegetable fritters (pakoras) submerged inside.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 280,
      sizes: JSON.stringify([{ size: 'Per Head', price: 280 }]),
      prepTime: 10,
      categoryId: dbCategories['desi-cuisine'],
      servingSize: '1 Person'
    },
    // KARAHI
    {
      name: 'White Chicken Karahi',
      description: 'Creamy white karahi cooked with green chilies, yogurt, cream, and ginger.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 900,
      sizes: JSON.stringify([
        { size: 'Half KG', price: 900 },
        { size: '1 KG', price: 1700 }
      ]),
      prepTime: 25,
      categoryId: dbCategories['karahi'],
      servingSize: '2-4 Persons'
    },
    {
      name: 'Chicken Karahi',
      description: 'Karachi specialty karahi cooked with tomatoes, green chilies, and black peppers.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800',
      price: 800,
      sizes: JSON.stringify([
        { size: 'Half KG', price: 800 },
        { size: '1 KG', price: 1550 }
      ]),
      prepTime: 25,
      categoryId: dbCategories['karahi'],
      servingSize: '2-4 Persons'
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
      servingSize: '2-4 Persons'
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
