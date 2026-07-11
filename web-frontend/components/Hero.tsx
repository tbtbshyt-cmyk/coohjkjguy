import Link from 'next/link';
import { ChevronLeft, Truck, ShieldCheck, Sparkles, Crown } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src="https://cdn.abu-bishar.com/hero-bg.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-l from-ink-800/90 via-ink-800/70 to-ink-800/95" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-ink-50">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 text-gold text-xs font-bold border border-gold/30 mb-5">
            <Crown className="w-3.5 h-3.5" /> مجموعة جديدة 2025
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
            <span className="block">أبو بشار</span>
            <span className="gradient-text">متجر الأناقة في شبوة/عتق</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-ink-200 max-w-xl leading-8">
            تشكيلة فاخرة من الملابس والأحذية — توصيل مجاني، دفع عند الاستلام، تجربة فريدة.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/products" className="btn-gold">تسوق الآن <ChevronLeft className="w-4 h-4" /></Link>
            <Link href="/flash" className="btn-ghost"><Sparkles className="w-4 h-4" /> العروض</Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-200"><Truck className="w-4 h-4 text-gold shrink-0" /> توصيل مجاني</div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-200"><ShieldCheck className="w-4 h-4 text-gold shrink-0" /> دفع عند الاستلام</div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-200"><Sparkles className="w-4 h-4 text-gold shrink-0" /> جودة فاخرة</div>
          </div>
        </div>
      </div>
    </section>
  );
}