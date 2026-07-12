import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding THE VESTRA database...');

  // Clean existing tables (order matters to avoid constraint violations)
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.address.deleteMany();
  await prisma.websiteSetting.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.profile.deleteMany();

  console.log('Database cleaned.');

  // 1. Create Default Profiles
  const adminProfile = await prisma.profile.create({
    data: {
      id: 'mock_admin_123',
      email: 'admin@thevestra.com',
      fullName: 'THE VESTRA Admin',
      role: 'admin',
      phone: '03700349146',
      whatsapp: '+923700349146',
    },
  });

  const customerProfile = await prisma.profile.create({
    data: {
      id: 'mock_customer_123',
      email: 'customer@thevestra.com',
      fullName: 'Hanzala Kamran',
      role: 'customer',
      phone: '03337654321',
      whatsapp: '03337654321',
    },
  });

  // 2. Saved Address for customer
  await prisma.address.create({
    data: {
      profileId: customerProfile.id,
      title: 'Home',
      fullAddress: 'Penthouse A-12, Phase 8, DHA',
      city: 'Karachi',
      province: 'Sindh',
      postalCode: '75500',
      phone: '03337654321',
      isDefault: true,
    },
  });

  // 3. Website Settings
  await prisma.websiteSetting.createMany({
    data: [
      { key: 'logo_text', value: 'THE VESTRA' },
      { key: 'website_status', value: 'OPEN' },
      { key: 'contact_phone', value: '03700349146' },
      { key: 'contact_email', value: 'concierge@thevestra.com' },
      { key: 'free_shipping_threshold', value: '5000' },
      { key: 'home_hero_title', value: 'WEAR CONFIDENCE.' },
      { key: 'home_hero_subtitle', value: 'Minimalist luxury tailored for the modern man. Experience premium long-staple cotton and structured silhouettes.' }
    ],
  });

  // 4. Create Collection
  const newArrival = await prisma.collection.create({
    data: {
      name: 'New Arrival',
      slug: 'new-arrival',
      description: 'The first clothing collection from Springfield. Premium fabrics, comfort, modern fit, and minimal design.',
      image: '/products/tshirts/product-01/image-01-front.png'
    }
  });

  // 5. Create Category
  const category = await prisma.category.create({
    data: {
      name: 'T-Shirts',
      slug: 't-shirts',
      image: '/products/tshirts/product-01/image-01-front.png'
    }
  });

  // 6. Create Premium Products
  const productsData = [
    {
      name: 'Springfield Explore Further Graphic Tee',
      description: 'Experience high-end comfort and premium fabric with this Springfield Explore Further Graphic Tee. Featuring a modern fit, a minimal design of the green earth motif on the chest, and an elaborate "Ride and Seek" map on the back, this everyday wear tee boasts a soft feel and a luxury finish for long-lasting sophistication.',
      price: 999,
      discount: 0,
      rating: 4.9,
      fabric: '100% Premium Organic Combed Cotton (240GSM)',
      fit: 'Modern Relaxed Fit',
      brand: 'Springfield',
      categoryId: category.id,
      collectionId: newArrival.id,
      images: [
        '/products/tshirts/product-01/image-01-front.png',
        '/products/tshirts/product-01/image-01-back.png'
      ],
      variants: [
        { color: 'Ivory White', size: 'XS', inventory: 25 },
        { color: 'Ivory White', size: 'S', inventory: 25 },
        { color: 'Ivory White', size: 'M', inventory: 25 },
        { color: 'Ivory White', size: 'L', inventory: 25 },
        { color: 'Ivory White', size: 'XL', inventory: 25 },
        { color: 'Ivory White', size: 'XXL', inventory: 25 }
      ]
    },
    {
      name: 'Springfield Vintage Culture Graphic Tee',
      description: 'Bring a classic retro feel to your wardrobe with the Springfield Vintage Culture Graphic Tee. Structured with premium fabric and featuring a modern fit, this everyday wear garment is designed with a vintage records logo on the front left chest and a bold turntable motif on the back. Enjoy a soft feel, long-lasting comfort, and a minimal design with a luxury finish.',
      price: 999,
      discount: 0,
      rating: 4.8,
      fabric: '100% Luxury Combed Cotton (220GSM)',
      fit: 'Modern Regular Fit',
      brand: 'Springfield',
      categoryId: category.id,
      collectionId: newArrival.id,
      images: [
        '/products/tshirts/product-02/image-02-front.png',
        '/products/tshirts/product-02/image-02-back.png'
      ],
      variants: [
        { color: 'Off-White', size: 'XS', inventory: 25 },
        { color: 'Off-White', size: 'S', inventory: 25 },
        { color: 'Off-White', size: 'M', inventory: 25 },
        { color: 'Off-White', size: 'L', inventory: 25 },
        { color: 'Off-White', size: 'XL', inventory: 25 },
        { color: 'Off-White', size: 'XXL', inventory: 25 }
      ]
    },
    {
      name: 'Springfield Luxury Ornament Tee',
      description: 'Crafted from high-density charcoal fabric, the Springfield Luxury Ornament Tee defines understated elegance. Spun from premium fabric for maximum comfort and a soft feel, it showcases a minimal design ornamental mandala on the chest and back. With a modern fit, long-lasting resilience, and a premium luxury finish, it is a staple of contemporary luxury.',
      price: 999,
      discount: 0,
      rating: 4.9,
      fabric: '100% Fine Combed Cotton (250GSM)',
      fit: 'Modern Fit',
      brand: 'Springfield',
      categoryId: category.id,
      collectionId: newArrival.id,
      images: [
        '/products/tshirts/product-03/image-03-front.png',
        '/products/tshirts/product-03/image-03-back.png'
      ],
      variants: [
        { color: 'Charcoal Grey', size: 'XS', inventory: 25 },
        { color: 'Charcoal Grey', size: 'S', inventory: 25 },
        { color: 'Charcoal Grey', size: 'M', inventory: 25 },
        { color: 'Charcoal Grey', size: 'L', inventory: 25 },
        { color: 'Charcoal Grey', size: 'XL', inventory: 25 },
        { color: 'Charcoal Grey', size: 'XXL', inventory: 25 }
      ]
    },
    {
      name: 'Springfield Alternative Culture Tee',
      description: 'Constructed from heavyweight premium fabric, the Springfield Alternative Culture Tee is engineered to elevate your daily wear. A minimal design featuring grid art on the left chest and a prominent back graphic, this modern fit tee offers a soft feel, long-lasting comfort, and a luxury finish. Wear your confidence with Springfield.',
      price: 999,
      discount: 0,
      rating: 4.7,
      fabric: '100% Combed Cotton Terry (260GSM)',
      fit: 'Modern Boxy Fit',
      brand: 'Springfield',
      categoryId: category.id,
      collectionId: newArrival.id,
      images: [
        '/products/tshirts/product-04/image-04-front.png',
        '/products/tshirts/product-04/image-04-back.png'
      ],
      variants: [
        { color: 'Prussian White', size: 'XS', inventory: 25 },
        { color: 'Prussian White', size: 'S', inventory: 25 },
        { color: 'Prussian White', size: 'M', inventory: 25 },
        { color: 'Prussian White', size: 'L', inventory: 25 },
        { color: 'Prussian White', size: 'XL', inventory: 25 },
        { color: 'Prussian White', size: 'XXL', inventory: 25 }
      ]
    }
  ];

  // Insert products, images, and variants
  for (const prod of productsData) {
    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        discount: prod.discount,
        rating: prod.rating,
        fabric: prod.fabric,
        fit: prod.fit,
        brand: prod.brand,
        categoryId: prod.categoryId,
        collectionId: prod.collectionId,
        available: true
      }
    });

    // Create images
    for (const imgUrl of prod.images) {
      await prisma.productImage.create({
        data: {
          url: imgUrl,
          productId: createdProduct.id
        }
      });
    }

    // Create variants
    for (const variant of prod.variants) {
      await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          color: variant.color,
          size: variant.size,
          inventory: variant.inventory,
          sku: `${createdProduct.name.substring(0, 3).toUpperCase()}-${variant.color.substring(0, 2).toUpperCase()}-${variant.size}-${createdProduct.id.substring(0, 4).toUpperCase()}`
        }
      });
    }

    // Create a mock review
    await prisma.review.create({
      data: {
        rating: 5,
        comment: `Absolutely love the material of this ${prod.name}! The fit is exact and the fabric feels extremely premium. Essential addition to my wardrobe.`,
        approved: true,
        featured: true,
        profileId: customerProfile.id,
        productId: createdProduct.id
      }
    });
  }

  console.log('Seeded THE VESTRA database successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
