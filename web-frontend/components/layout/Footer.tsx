import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 bg-ink-800 text-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <div className="font-black text-2xl gradient-text">أبو بشار</div>
          <p className="mt-3 text-sm text-ink-300 leading-7">متجر الأناقة في شبوة/عتق. ملابس وأحذية فاخرة بأسعار ممتازة، توصيل مجاني.</p>
        </div>
        <div>
          <h4 className="font-bold text-gold mb-3">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-gold transition">الرئيسية</Link></li>
            <li><Link href="/products" className="hover:text-gold transition">المنتجات</Link></li>
            <li><Link href="/flash" className="hover:text-gold transition">عروض محطم السعر</Link></li>
            <li><Link href="/admin" className="hover:text-gold transition">لوحة الإدارة</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gold mb-3">تواصل</h4>
          <ul className="space-y-2 text-sm text-ink-300">
            <li>شبوة / عتق — اليمن</li>
            <li dir="ltr">+967 7 000 0000</li>
            <li>support@abu-bishar.com</li>
          </ul>
        </div>
        <div className="text-xs text-ink-300">
          © {new Date().getFullYear()} أبو بشار. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}