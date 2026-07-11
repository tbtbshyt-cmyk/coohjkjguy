'use client';
import Link from 'next/link';
import { Moon, Sun, ShoppingCart, Search, Heart, Ruler } from 'lucide-react';
import { useApp } from '@/lib/store';

interface Props {
  onOpenCart?: () => void;
  onOpenSizeCalc?: () => void;
  onOpenLogin?: () => void;
  onLogoTap?: () => void;
}

export function Header({ onOpenSizeCalc }: Props) {
  const { theme, setTheme, cart, wishlist } = useApp();
  const cartCount = cart.reduce((s, c: any) => s + c.qty, 0);
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-ink-700/95 backdrop-blur border-b border-ink-100 dark:border-ink-600">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center gap-3">
        <Link href="/" className="font-black text-2xl gradient-text shrink-0">أبو بشار</Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-ink-600 dark:text-ink-100">
          <Link href="/" className="hover:text-gold transition">الرئيسية</Link>
          <Link href="/products" className="hover:text-gold transition">المنتجات</Link>
          <Link href="/flash" className="hover:text-gold transition">العروض</Link>
        </nav>
        <form className="hidden md:flex flex-1 max-w-md mx-4 relative" onSubmit={(e) => e.preventDefault()}>
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input placeholder="ابحث عن منتج..." className="w-full pr-10 pl-4 py-2 rounded-full bg-ink-50 dark:bg-ink-800 border border-transparent focus:border-gold outline-none text-sm" />
        </form>
        <div className="flex items-center gap-1 sm:gap-2 mr-auto">
          <button onClick={onOpenSizeCalc} className="hidden sm:flex p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-600" aria-label="حاسبة المقاسات">
            <Ruler className="w-5 h-5" />
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-600" aria-label="تبديل المظهر">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link href="/wishlist" className="relative p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-600" aria-label="المفضلة">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && <span className="absolute -top-1 -left-1 bg-gold text-ink-800 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{wishlist.length}</span>}
          </Link>
          <Link href="/cart" className="relative p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-600" aria-label="السلة">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-1 -left-1 bg-gold text-ink-800 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}