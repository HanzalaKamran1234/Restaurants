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

  // 4. Create Collections
  const winterMinimalist = await prisma.collection.create({
    data: {
      name: 'Winter Minimalist',
      slug: 'winter-minimalist',
      description: 'Sculpted outerwear, heavy cashmere knits, and clean structural wool coats designed for timeless warmth.',
      image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800'
    }
  });

  const essentialLoungewear = await prisma.collection.create({
    data: {
      name: 'Essential Loungewear',
      slug: 'essential-loungewear',
      description: 'Heavyweight organic cotton loopback fleece garments. Laidback elegance for daily comfort.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'
    }
  });

  const classicTailoring = await prisma.collection.create({
    data: {
      name: 'Classic Tailoring',
      slug: 'classic-tailoring',
      description: 'Perfected collars, double-ply crisp cotton weave, and hand-tailored trousers for boardroom and gala.',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800'
    }
  });

  const newArrival = await prisma.collection.create({
    data: {
      name: 'New Arrival',
      slug: 'new-arrival',
      description: 'The first clothing collection from Springfield. Premium fabrics, comfort, modern fit, and minimal design.',
      image: '/products/tshirts/product-01/image-01-front.jpg'
    }
  });

  // 5. Create Categories
  const categoriesData = [
    { name: 'T-Shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800' },
    { name: 'Oversized T-Shirts', slug: 'oversized-t-shirts', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Polo Shirts', slug: 'polo-shirts', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800' },
    { name: 'Formal Shirts', slug: 'formal-shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800' },
    { name: 'Casual Shirts', slug: 'casual-shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Jeans', slug: 'jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Trousers', slug: 'trousers', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800' },
    { name: 'Cargo Pants', slug: 'cargo-pants', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800' },
    { name: 'Hoodies', slug: 'hoodies', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Sweatshirts', slug: 'sweatshirts', image: 'https://images.unsplash.com/photo-1578768079052-aa76e51e1336?auto=format&fit=crop&q=80&w=800' },
    { name: 'Jackets', slug: 'jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800' },
    { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&q=80&w=800' },
  ];

  const categories: { [key: string]: string } = {};
  for (const cat of categoriesData) {
    const dbCat = await prisma.category.create({
      data: cat
    });
    categories[cat.slug] = dbCat.id;
  }

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
      categoryId: categories['t-shirts'],
      collectionId: newArrival.id,
      images: [
        '/products/tshirts/product-01/image-01-front.jpg',
        '/products/tshirts/product-01/image-01-back.jpg'
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
      categoryId: categories['t-shirts'],
      collectionId: newArrival.id,
      images: [
        '/products/tshirts/product-02/image-02-front.jpg',
        '/products/tshirts/product-02/image-02-back.jpg'
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
      categoryId: categories['t-shirts'],
      collectionId: newArrival.id,
      images: [
        '/products/tshirts/product-03/image-03-front.jpg',
        '/products/tshirts/product-03/image-03-back.jpg'
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
      categoryId: categories['t-shirts'],
      collectionId: newArrival.id,
      images: [
        '/products/tshirts/product-04/image-04-front.jpg',
        '/products/tshirts/product-04/image-04-back.jpg'
      ],
      variants: [
        { color: 'Prussian White', size: 'XS', inventory: 25 },
        { color: 'Prussian White', size: 'S', inventory: 25 },
        { color: 'Prussian White', size: 'M', inventory: 25 },
        { color: 'Prussian White', size: 'L', inventory: 25 },
        { color: 'Prussian White', size: 'XL', inventory: 25 },
        { color: 'Prussian White', size: 'XXL', inventory: 25 }
      ]
    },
    {
      name: 'THE VESTRA Heavyweight Oversized Tee',
      description: 'An architectural essential crafted from custom 280GSM loopback combed organic cotton. Featuring a tight ribbed collar, drop shoulders, and a clean structural drape that maintains its shape through wash and wear.',
      price: 2450,
      discount: 10,
      rating: 4.9,
      fabric: '100% Heavyweight Combed Organic Cotton (280GSM)',
      fit: 'Oversized Boxy Fit',
      brand: 'THE VESTRA',
      categoryId: categories['oversized-t-shirts'],
      collectionId: essentialLoungewear.id,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [
        { color: 'Obsidian Black', size: 'S', inventory: 15 },
        { color: 'Obsidian Black', size: 'M', inventory: 30 },
        { color: 'Obsidian Black', size: 'L', inventory: 25 },
        { color: 'Obsidian Black', size: 'XL', inventory: 10 },
        { color: 'Warm Ivory', size: 'S', inventory: 20 },
        { color: 'Warm Ivory', size: 'M', inventory: 35 },
        { color: 'Warm Ivory', size: 'L', inventory: 15 }
      ]
    },
    {
      name: 'Signature Minimalist Knit Polo',
      description: 'Fusing relaxed luxury with classic polo heritage. Knitted with high-gauge double-mercerized long-staple cotton for a micro-textured visual depth. Finished with a clean placket-less open collar.',
      price: 3800,
      discount: 0,
      rating: 4.8,
      fabric: '100% Mercerized Long-Staple Cotton (High Gauge)',
      fit: 'Relaxed Tailored Fit',
      brand: 'THE VESTRA',
      categoryId: categories['polo-shirts'],
      collectionId: classicTailoring.id,
      images: [
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1620012253295-c05cb1e6576f?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [
        { color: 'Desert Camel', size: 'S', inventory: 8 },
        { color: 'Desert Camel', size: 'M', inventory: 12 },
        { color: 'Desert Camel', size: 'L', inventory: 14 },
        { color: 'Slate Grey', size: 'S', inventory: 10 },
        { color: 'Slate Grey', size: 'M', inventory: 20 },
        { color: 'Slate Grey', size: 'L', inventory: 18 }
      ]
    },
    {
      name: 'Structured Oxford Tailored Shirt',
      description: 'A contemporary reconstruction of the traditional Oxford button-down. Crafted with crisp double-ply Egyptian cotton and structured backing along the cuffs and collar to maintain a pristine, wrinkle-resistant shape.',
      price: 5200,
      discount: 0,
      rating: 4.7,
      fabric: '100% Premium Egyptian Cotton (Two-Ply)',
      fit: 'Slim Tailored Fit',
      brand: 'THE VESTRA',
      categoryId: categories['formal-shirts'],
      collectionId: classicTailoring.id,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [
        { color: 'Warm Ivory', size: 'M', inventory: 25 },
        { color: 'Warm Ivory', size: 'L', inventory: 30 },
        { color: 'Slate Grey', size: 'M', inventory: 15 },
        { color: 'Slate Grey', size: 'L', inventory: 15 }
      ]
    },
    {
      name: 'Japanese Selvedge Denim Jeans',
      description: 'Sourced from legendary mills in Kojima, Japan. Raw selvedge indigo denim woven on vintage shuttle looms. Designed to wear-in beautifully, developing custom character lines unique to your lifestyle.',
      price: 8500,
      discount: 15,
      rating: 5.0,
      fabric: '13.5oz Raw Japanese Selvedge Cotton Denim',
      fit: 'Classic Straight Leg',
      brand: 'THE VESTRA',
      categoryId: categories['jeans'],
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1582552938357-32b906df43cd?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [
        { color: 'Obsidian Black', size: '30', inventory: 10 },
        { color: 'Obsidian Black', size: '32', inventory: 15 },
        { color: 'Obsidian Black', size: '34', inventory: 15 },
        { color: 'Obsidian Black', size: '36', inventory: 8 }
      ]
    },
    {
      name: 'THE VESTRA Heavyweight Loopback Hoodie',
      description: 'Featuring an ultra-clean double-lined hood without drawstrings for a streamlined editorial finish. Knit in a heavyweight 450GSM organic loopback fleece with side rib panels for maximum movement.',
      price: 6800,
      discount: 0,
      rating: 4.9,
      fabric: '100% Organic Loopback Cotton (450GSM)',
      fit: 'Relaxed Dropped Shoulder Fit',
      brand: 'THE VESTRA',
      categoryId: categories['hoodies'],
      collectionId: essentialLoungewear.id,
      images: [
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1578768079052-aa76e51e1336?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [
        { color: 'Obsidian Black', size: 'S', inventory: 12 },
        { color: 'Obsidian Black', size: 'M', inventory: 25 },
        { color: 'Obsidian Black', size: 'L', inventory: 20 },
        { color: 'Desert Camel', size: 'S', inventory: 8 },
        { color: 'Desert Camel', size: 'M', inventory: 15 },
        { color: 'Desert Camel', size: 'L', inventory: 12 }
      ]
    },
    {
      name: 'Cashmere-Wool Double-Breasted Trench',
      description: 'An heirloom piece engineered for ultimate colder-season luxury. Blended from virgin wool and Mongolian cashmere, providing structural drape and silk-like softness. Completed with horn buttons and a self-belt.',
      price: 18500,
      discount: 0,
      rating: 5.0,
      fabric: '85% Virgin Wool, 15% Premium Cashmere',
      fit: 'Longline Tailored Trench',
      brand: 'THE VESTRA',
      categoryId: categories['jackets'],
      collectionId: winterMinimalist.id,
      images: [
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [
        { color: 'Desert Camel', size: 'S', inventory: 5 },
        { color: 'Desert Camel', size: 'M', inventory: 8 },
        { color: 'Desert Camel', size: 'L', inventory: 6 },
        { color: 'Obsidian Black', size: 'S', inventory: 4 },
        { color: 'Obsidian Black', size: 'M', inventory: 10 },
        { color: 'Obsidian Black', size: 'L', inventory: 8 }
      ]
    },
    {
      name: 'Pleated Minimalist Casual Trouser',
      description: 'Bridging modern streetwear shapes with classical sartorial pleats. Tailored with a mid-rise waist, single front sharp pleats, and a relaxed taper down the leg. Woven in a lightweight wool blend for all-year luxury.',
      price: 4950,
      discount: 10,
      rating: 4.6,
      fabric: '65% Rayon, 30% Polyester, 5% Wool Blend',
      fit: 'Relaxed Tapered Pleated Fit',
      brand: 'THE VESTRA',
      categoryId: categories['trousers'],
      collectionId: classicTailoring.id,
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [
        { color: 'Slate Grey', size: '30', inventory: 12 },
        { color: 'Slate Grey', size: '32', inventory: 20 },
        { color: 'Slate Grey', size: '34', inventory: 15 },
        { color: 'Obsidian Black', size: '30', inventory: 10 },
        { color: 'Obsidian Black', size: '32', inventory: 18 }
      ]
    },
    {
      name: 'THE VESTRA Fine Leather Everyday Belt',
      description: 'A timeless accessory built from vegetable-tanned full-grain Italian leather. Embellished with a matte brass solid buckle, designed to mature with a unique dark patina over years of use.',
      price: 2950,
      discount: 0,
      rating: 4.8,
      fabric: '100% Full-Grain Vegetable-Tanned Italian Leather',
      fit: 'Standard Belt Width (1.25 inches)',
      brand: 'THE VESTRA',
      categoryId: categories['accessories'],
      images: [
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&q=80&w=800'
      ],
      variants: [
        { color: 'Desert Camel', size: 'M', inventory: 20 },
        { color: 'Desert Camel', size: 'L', inventory: 15 },
        { color: 'Obsidian Black', size: 'M', inventory: 25 },
        { color: 'Obsidian Black', size: 'L', inventory: 20 }
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
