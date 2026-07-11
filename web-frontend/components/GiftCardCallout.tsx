'use client';
import { Gift, Send } from 'lucide-react';

export function GiftCardCallout() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-ink-800 via-ink-700 to-ink-800 text-ink-50 relative overflow-hidden border-gold/30">
        <div className="grid md:grid-cols-2 gap-6 items-center relative">
          <div>
            <Gift className="w-10 h-10 text-gold mb-3" />
            <h3 className="text-2xl sm:text-3xl font-black mb-2">أهدِ كارت رقمي فاخر 🎁</h3>
            <p className="text-sm text-ink-200 mb-4">كروت هدايا بأي مبلغ تريده، ترسلها لأصدقائك عبر الواتساب بضغطة زر.</p>
            <ul className="text-sm space-y-1 text-ink-200">
              <li>✓ صالح لجميع المنتجات</li>
              <li>✓ لا تاريخ صلاحية</li>
              <li>✓ يُسلَّم مباشرة عبر رابط أو QR</li>
            </ul>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-gold/20 text-center">
            <div className="text-xs text-ink-200 mb-1">ابدأ الإهداء</div>
            <div className="text-2xl font-black text-gold mb-3">من 1,000 ر.ي</div>
            <a href="https://wa.me/967700000000" target="_blank" rel="noreferrer" className="btn-gold w-full">
              <Send className="w-4 h-4" /> اطلب عبر واتساب
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}