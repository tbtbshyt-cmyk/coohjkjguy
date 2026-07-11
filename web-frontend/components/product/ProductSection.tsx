'use client';
import { useQuery } from '@tanstack/react-query';
import { ProductsAPI } from '@/lib/api';
import { useApp } from '@/lib/store';
import { formatMoney } from '@/lib/format';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Zap } from 'lucide-react';

interface Props { title: string; subtitle?: string; onlyFlash?: boolean }

export function ProductSection({ title, subtitle, onlyFlash }: Props) {
  const { currency, toggleWishlist, wishlist } = useApp();
  const { data, isLoading } = useQuery({
    queryKey: onlyFlash ? ['products', 'flash'] : ['products', 'home'],
    queryFn: () => onlyFlash ? ProductsAPI.flashSale() : ProductsAPI.list({ limit: 8, featured: true }),
  });

  const items: any[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <section id={onlyFlash ? 'flash' : 'products'} className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black">{title}</h2>
        {subtitle && <p className="text-sm text-ink-300 mt-1">{subtitle}</p>}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map((i) => <div key={i} className="card"><div className="aspect-square skeleton" /></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-lg font-bold mb-2">لا توجد منتجات متاحة</p>
          <p className="text-sm text-ink-300">سيتم تحديث المنتجات قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {items.map((p) => {
            const liked = wishlist.find((w) => w.productId === p.id);
            const discounted = p.oldPrice && p.oldPrice > p.basePrice;
            const pct = discounted ? Math.round(((p.oldPrice - p.basePrice) / p.oldPrice) * 100) : 0;
            const img = (p.images?.[0]?.webpUrl || p.images?.[0]?.url || '').replace('https://cdn.abu-bishar.com', '');
            return (
              <div key={p.id} className="card group flex flex-col relative">
                {p.isFlashSale && (
                  <div className="absolute top-3 right-3 z-10 chip bg-red-500/15 text-red-500"><Zap className="w-3 h-3" /> -{pct}%</div>
                )}
                <button onClick={() => toggleWishlist(p.id)} className={`absolute top-3 left-3 z-10 p-2 rounded-full bg-white/90 dark:bg-ink-800/90 ${liked ? 'text-red-500' : ''}`}>
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                </button>
                <Link href={`/products/${p.slug}`} className="aspect-square overflow-hidden bg-ink-50 dark:bg-ink-800 relative">
                  {img && <Image src={`https://cdn.abu-bishar.com${img}`} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-700" sizes="(max-width: 768px) 50vw, 25vw" />}
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1 min-h-[2.5em]">{p.name}</h3>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <div className="text-lg font-black text-gold">{formatMoney(p.basePrice, currency)}</div>
                      {discounted && <div className="text-xs text-ink-300 line-through">{formatMoney(p.oldPrice, currency)}</div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}