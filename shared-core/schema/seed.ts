import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding أبو بشار database...');

  // -------- Admin User --------
  const adminPassword = await argon2.hash('bshy 776430');
  await prisma.adminUser.upsert({
    where: { email: 'tbashyalo566@gmail.com' },
    create: {
      email: 'tbashyalo566@gmail.com',
      passwordHash: adminPassword,
      fullName: 'Tariq Bashyal',
      role: 'SUPER_ADMIN',
    },
    update: {},
  });
  console.log('  ✓ Admin user created');

  // -------- Categories --------
  const categories = [
    { slug: 'MEN', nameAr: 'رجالي', sortOrder: 1 },
    { slug: 'WOMEN', nameAr: 'نسائي', sortOrder: 2 },
    { slug: 'KIDS', nameAr: 'أطفال', sortOrder: 3 },
    { slug: 'SHOES', nameAr: 'أحذية', sortOrder: 4 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug as any },
      create: c as any,
      update: c,
    });
  }
  console.log('  ✓ Categories created');

  // -------- Brand --------
  const brand = await prisma.brand.upsert({
    where: { name: 'أبو بشار' },
    create: { name: 'أبو بشار' },
    update: {},
  });

  // -------- Products --------
  const products = [
    { sku: 'AB-MEN-001', slug: 'black-formal-suit', nameAr: 'بدلة رسمية سوداء', nameEn: 'Black Formal Suit',
      descriptionAr: 'بدلة سوداء رسمية بتفاصيل ذهبية، قماش عالي الجودة مناسبة للمناسبات.',
      basePrice: 18000, oldPrice: 24000, categorySlug: 'MEN',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['أسود', 'كحلي'],
      isFeatured: true, isFlashSale: true, imageUrl: '/product-men-1.jpg' },
    { sku: 'AB-MEN-002', slug: 'white-thobe', nameAr: 'ثوب أبيض تقليدي', nameEn: 'White Traditional Thobe',
      descriptionAr: 'ثوب أبيض تقليدي بقماش مريح وأنيق، مثالي للصلاة والمناسبات.',
      basePrice: 9500, categorySlug: 'MEN',
      sizes: ['M', 'L', 'XL', 'XXL'], colors: ['أبيض', 'أوف وايت'],
      isFeatured: true, imageUrl: '/product-men-2.jpg' },
    { sku: 'AB-MEN-003', slug: 'navy-casual-jacket', nameAr: 'جاكيت كحلي كاجوال', nameEn: 'Navy Casual Jacket',
      descriptionAr: 'جاكيت كحلي عصري مريح، مناسب للخروج والعمل اليومي.',
      basePrice: 12000, oldPrice: 15500, categorySlug: 'MEN',
      sizes: ['M', 'L', 'XL'], colors: ['كحلي', 'أسود'],
      isFeatured: true, isFlashSale: true, imageUrl: '/product-men-3.jpg' },
    { sku: 'AB-SHOES-001', slug: 'brown-leather-shoe', nameAr: 'حذاء جلد بني رجالي', nameEn: 'Brown Leather Shoe',
      descriptionAr: 'حذاء جلد طبيعي بني، تصميم كلاسيكي أنيق يناسب البدلات والثوب.',
      basePrice: 14000, oldPrice: 18000, categorySlug: 'SHOES',
      sizes: ['40', '41', '42', '43', '44', '45'], colors: ['بني', 'أسود'],
      isFeatured: true, isFlashSale: true, imageUrl: '/product-shoes-1.jpg' },
    { sku: 'AB-SHOES-002', slug: 'denim-embroidered-jacket', nameAr: 'جاكيت جينز مطرز', nameEn: 'Embroidered Denim Jacket',
      descriptionAr: 'جاكيت جينز بتطريز يدوي ذهبي، مظهر عصري مميز للشباب.',
      basePrice: 13500, categorySlug: 'SHOES',
      sizes: ['M', 'L', 'XL'], colors: ['أزرق', 'كحلي'],
      isFeatured: true, imageUrl: '/product-shoes-2.jpg' },
    { sku: 'AB-SHOES-003', slug: 'kids-school-shoe', nameAr: 'حذاء أطفال مدرسي', nameEn: 'Kids School Shoe',
      descriptionAr: 'حذاء مدرسي مريح للأطفال، خفيف ومتين للاستخدام اليومي.',
      basePrice: 6500, oldPrice: 8500, categorySlug: 'SHOES',
      sizes: ['28', '29', '30', '31', '32', '33'], colors: ['أسود', 'كحلي'],
      isFeatured: true, isFlashSale: true, imageUrl: '/product-shoes-3.jpg' },
    { sku: 'AB-WOMEN-001', slug: 'red-evening-dress', nameAr: 'فستان سهرة أحمر', nameEn: 'Red Evening Dress',
      descriptionAr: 'فستان سهرة أحمر ناري بتصميم ملكي فخم، قماش فاخر بقصة عصرية.',
      basePrice: 22000, oldPrice: 28000, categorySlug: 'WOMEN',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['أحمر', 'أسود'],
      isFeatured: true, isFlashSale: true, imageUrl: '/product-women-1.jpg' },
    { sku: 'AB-WOMEN-002', slug: 'black-abaya', nameAr: 'عباية سوداء مطرزة', nameEn: 'Black Embroidered Abaya',
      descriptionAr: 'عباية سوداء بتطريز ذهبي، أناقة تقليدية عصرية تناسب المناسبات.',
      basePrice: 16500, categorySlug: 'WOMEN',
      sizes: ['M', 'L', 'XL', 'XXL'], colors: ['أسود', 'كحلي'],
      isFeatured: true, imageUrl: '/product-women-2.jpg' },
    { sku: 'AB-WOMEN-003', slug: 'black-heel', nameAr: 'كعب أسود نسائي', nameEn: 'Black Women Heel',
      descriptionAr: 'حذاء كعب أنيق بتصميم عصري، مريح للاستخدام اليومي والمناسبات.',
      basePrice: 11000, categorySlug: 'WOMEN',
      sizes: ['36', '37', '38', '39', '40'], colors: ['أسود', 'بيج'],
      isFeatured: true, imageUrl: '/product-women-3.jpg' },
    { sku: 'AB-KIDS-001', slug: 'kids-casual-set', nameAr: 'طقم أطفال كاجوال', nameEn: 'Kids Casual Set',
      descriptionAr: 'طقم كاجوال مريح وأنيق للأطفال، خفيف ومثالي للعب والمدرسة.',
      basePrice: 7500, oldPrice: 9500, categorySlug: 'KIDS',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], colors: ['أزرق', 'وردي', 'أخضر'],
      isFeatured: true, isFlashSale: true, imageUrl: '/product-kids-1.jpg' },
    { sku: 'AB-KIDS-002', slug: 'pink-girl-dress', nameAr: 'فستان بناتي وردي', nameEn: 'Pink Girls Dress',
      descriptionAr: 'فستان بناتي وردي بتصميم عصري مميز، مزخرف بزهور وألوان مبهجة.',
      basePrice: 8500, categorySlug: 'KIDS',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], colors: ['وردي', 'بنفسجي'],
      isFeatured: true, imageUrl: '/product-kids-2.jpg' },
  ];

  for (const p of products) {
    const { categorySlug, imageUrl, ...rest } = p as any;
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug as any } });
    if (!cat) continue;
    await prisma.product.upsert({
      where: { sku: rest.sku },
      create: {
        ...rest,
        categoryId: cat.id,
        brandId: brand.id,
        stock: 20, soldCount: 10, rating: 4.7,
        tags: ['جديد'],
        images: { create: { url: imageUrl, webpUrl: imageUrl, isPrimary: true, width: 1200, height: 1200, bytes: 100000 } },
      },
      update: {},
    });
  }
  console.log(`  ✓ ${products.length} products created`);

  // -------- Vouchers --------
  const vouchers = [
    { code: 'WELCOME10', type: 'PERCENTAGE' as any, value: 10, descriptionAr: 'خصم ترحيبي 10%', minOrderAmount: 5000 },
    { code: 'COMEBACK5', type: 'PERCENTAGE' as any, value: 5, descriptionAr: 'خصم استرجاع السلة 5%', minOrderAmount: 2000 },
    { code: 'STAY10', type: 'PERCENTAGE' as any, value: 10, descriptionAr: 'خصم الخروج من الموقع' },
    { code: 'FREESHIP', type: 'FREE_SHIPPING' as any, value: 0, descriptionAr: 'شحن مجاني' },
  ];
  for (const v of vouchers) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      create: v as any,
      update: v,
    });
  }
  console.log('  ✓ Vouchers created');

  // -------- Settings --------
  const settings: any[] = [
    { key: 'store', value: { name: 'أبو بشار', primaryColor: '#D4AF37', currency: 'YER', address: 'شبوة / عتق — Yemen' }, group: 'general' },
    { key: 'shipping', value: { freeShipping: true, shippingFee: 0 }, group: 'shipping' },
    { key: 'loyalty', value: { pointsPerYER: 100, yERPerPoint: 50 }, group: 'loyalty' },
    { key: 'autoDiscount', value: { enabled: true, startHour: 20, endHour: 23, percent: 15 }, group: 'loyalty' },
    { key: 'countdown', value: { enabled: true, label: 'عروض محطم السعر', endsAt: new Date(Date.now() + 3 * 86400000).toISOString() }, group: 'general' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, create: s, update: s });
  }
  console.log('  ✓ Settings created');

  // -------- Currency Rates --------
  const rates = [
    { target: 'YER', rate: 1 },
    { target: 'SAR', rate: 0.0154 },
    { target: 'USD', rate: 0.004 },
  ];
  for (const r of rates) {
    await prisma.currencyRate.upsert({
      where: { target: r.target },
      create: { ...r, base: 'YER' },
      update: { rate: r.rate },
    });
  }
  console.log('  ✓ Currency rates created');

  console.log('✅ Seed completed');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });