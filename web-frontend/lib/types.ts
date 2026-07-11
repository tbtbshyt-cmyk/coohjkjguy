export interface ProductImage { id: string; url: string; webpUrl?: string; blurhash?: string; width?: number; height?: number; isPrimary: boolean; }
export interface Product {
  id: string; sku: string; slug: string; name: string;
  description: string;
  basePrice: number; oldPrice?: number; discountPercent?: number;
  currency: string; category?: { id: string; slug: string; nameAr: string };
  brand?: { id: string; name: string };
  sizes: string[]; colors: string[]; tags: string[];
  stock: number; soldCount: number; rating: number; reviewCount: number;
  isFeatured: boolean; isFlashSale: boolean; isNewArrival: boolean;
  images: ProductImage[]; createdAt: string;
}
