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

  // Admin in User table (compatibility)
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

  // Separate AdminUser table record
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
      discount: 0,
      available: true,
      prepTime: 15,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
      categoryId: fastFood.id,
    },
    {
      name: 'Zinger Burger',
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
      name: 'Shawarma',
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
  ];

  // Menu items - DESI KHANY
  const desiItems = [
    {
      name: 'Chicken Biryani',
      description: 'Karachi style aromatic basmati rice layered with spicy chicken masala, potatoes, saffron, and fresh mint leaves.',
      ingredients: 'Basmati Rice, Marinated Chicken, Saffron, Mint, Spices, Potatoes',
      calories: 650,
      spiceLevel: 'SPICY',
      servingSize: '1 Person',
      price: 390,
      discount: 0,
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
  ];

  await prisma.menuItem.createMany({ data: [...fastFoodItems, ...desiItems] });

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
