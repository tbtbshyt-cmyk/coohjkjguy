import { Hero } from '@/components/Hero';
import { BrandsBar } from '@/components/BrandsBar';
import { ProductSection } from '@/components/product/ProductSection';
import { GiftCardCallout } from '@/components/GiftCardCallout';

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandsBar />
      <ProductSection title="منتجاتنا" subtitle="تشكيلة مختارة لكل الأذواق" />
      <ProductSection onlyFlash title="⚡ عروض محطم السعر" />
      <GiftCardCallout />
    </>
  );
}
