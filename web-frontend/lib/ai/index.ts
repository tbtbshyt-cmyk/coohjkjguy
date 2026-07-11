import { Product } from '@/lib/types';
export interface SalesContext { query: string; products: Product[] }
export function salesAssistantReply(ctx: SalesContext): string {
  const q = ctx.query.trim();
  if (!q) return 'أهلاً بك في أبو بشار 👑 كيف أقدر أساعدك؟';
  if (/(مرحب|سلام|اهلا|هلا)/.test(q)) return 'أهلاً وسهلاً! أقدر أساعدك في اختيار الملابس، حساب مقاسك، أو متابعة العروض.';
  if (/(دفع|كاش)/.test(q)) return 'الدفع عند الاستلام متاح في شبوة/عتق، والتوصيل مجاني.';
  if (/(رجال|نسائي|طفل|حذاء)/.test(q)) return 'لدينا تشكيلة كاملة. اطلع على قسم المنتجات في الأعلى.';
  if (/(مقاس)/.test(q)) return 'لحساب مقاسك فوراً، تواصل معنا أو زُر صفحة المنتج وحاسبة المقاسات في الأسفل.';
  return `بحثك عن "${q}" — أرني ما تحتاج وأنا بخدمتك.`;
}
