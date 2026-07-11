'use client';
import { useApp } from '@/lib/store';
import { ShoppingCart, X } from 'lucide-react';

export function CartDrawer() {
  const { cart, theme } = useApp();
  if (cart.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 card p-3 flex items-center gap-3 max-w-xs shadow-xl">
      <ShoppingCart className="w-5 h-5 text-gold" />
      <span className="text-sm">{cart.length} منتج في السلة</span>
      <a href="/cart" className="btn-gold !py-1.5 !px-3 text-xs">عرض</a>
    </div>
  );
}