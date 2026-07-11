import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black gradient-text mb-3">404</h1>
      <p className="text-lg text-ink-300 mb-6">الصفحة غير موجودة</p>
      <Link href="/" className="btn-gold">العودة للرئيسية</Link>
    </div>
  );
}
