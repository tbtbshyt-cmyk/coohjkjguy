import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface ChatContext { query: string; products: any[] }

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  // ============ #1 Sales Assistant ============
  async assistant(sessionId: string | null, message: string, context: any = {}) {
    const products = await this.prisma.product.findMany({
      where: { isFeatured: true },
      take: 8,
      include: { images: { take: 1 }, category: true },
      orderBy: { soldCount: 'desc' },
    });

    const reply = this.generateReply(message, products);

    // Persist chat session
    let sid = sessionId;
    if (!sid) {
      const s = await this.prisma.chatSession.create({ data: { sessionToken: `cs_${Date.now()}` } });
      sid = s.id;
    }
    await this.prisma.chatMessage.create({
      data: { sessionId: sid, role: 'user', content: message, metadata: context as any },
    });
    await this.prisma.chatMessage.create({
      data: { sessionId: sid, role: 'assistant', content: reply, metadata: { productIds: products.slice(0, 3).map((p) => p.id) } as any },
    });

    return {
      sessionId: sid,
      reply,
      suggestions: products.slice(0, 3).map((p) => ({ productId: p.id, reason: 'best_seller' })),
    };
  }

  private generateReply(q: string, products: any[]): string {
    const lower = q.toLowerCase();
    if (/(مرحب|سلام|اهلا|هلا)/.test(q)) return 'أهلاً بك في أبو بشار 👑 كيف أقدر أساعدك اليوم؟';
    if (/(عرض|تخفيض|خصم|sale)/.test(q)) return `لدينا ${products.filter((p) => p.oldPrice).length} قطعة بعروض مميزة حالياً. تبي تشوفها؟`;
    if (/(رجال|رجالي)/.test(q)) return 'لدينا تشكيلة رجالية فاخرة. شو تبحث عنه بالضبط؟';
    if (/(نسا|نسائي)/.test(q)) return 'تشكيلة نسائية أنيقة. هل تبي شي رسمي ولا كاجوال؟';
    if (/(طفل|اطفال)/.test(q)) return 'لدينا أزياء أطفال مريحة وأنيقة.';
    if (/(حذاء|كعب)/.test(q)) return 'الأحذية متوفرة بعدة أصناف.';
    if (/(مقاس|سايز)/.test(q)) return 'استخدم حاسبة المقاسات في القائمة الجانبية.';
    if (/(دفع|كاش)/.test(q)) return 'الدفع عند الاستلام متاح في شبوة/عتق.';
    if (products.length > 0) {
      const top = products[0];
      return `بحثك عن "${q}" — هذا اللي لقيته الأقرب:\n• ${top.nameAr} — ${Number(top.basePrice).toLocaleString('ar-EG')} ر.ي`;
    }
    return 'لم أجد نتائج دقيقة. ممكن توضح أكثر؟';
  }

  // ============ #2 Size Calculator ============
  sizeCalc(input: { heightCm: number; weightKg: number; footCm?: number; category: string }) {
    const bmi = input.weightKg / Math.pow(input.heightCm / 100, 2);
    const notes: string[] = [];
    if (bmi < 18.5) notes.push('وزنك نحيف — نرشح مقاس أصغر قليلاً.');
    else if (bmi > 30) notes.push('نرشح مقاس أكبر للراحة.');
    else notes.push('مقاسك في النطاق المثالي.');

    let top = 'M';
    if (input.heightCm < 165) top = 'S';
    else if (input.heightCm < 175) top = 'M';
    else if (input.heightCm < 185) top = 'L';
    else top = 'XL';
    if (input.weightKg > 90) top = this.nextSize(top, 1);
    if (input.weightKg < 55) top = this.nextSize(top, -1);

    let shoe: string | undefined;
    if (input.footCm) {
      const eu = Math.round(input.footCm * 1.5 + 2);
      shoe = String(eu);
      notes.push(`طول قدمك ${input.footCm} سم = مقاس ${eu} أوروبي.`);
    }
    return { topSize: top, bottomSize: top, shoeSize: shoe, confidence: 0.85, notes };
  }

  private nextSize(s: string, dir: 1 | -1): string {
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const i = order.indexOf(s);
    if (i < 0) return s;
    return order[Math.min(order.length - 1, Math.max(0, i + dir))];
  }

  // ============ #7 Inventory Analytics ============
  async inventoryInsights() {
    const products = await this.prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, nameAr: true, stock: true, soldCount: true, createdAt: true, lowStockThreshold: true },
    });
    const day = 86400000;
    const now = Date.now();
    const alerts = products.map((p) => {
      const ageDays = Math.max(1, (now - p.createdAt.getTime()) / day);
      const weeklyDemand = Math.max(0, (p.soldCount / ageDays) * 7);
      const daysOfStock = weeklyDemand > 0 ? p.stock / (weeklyDemand / 7) : 9999;
      let alert: 'LOW' | 'OVERSTOCK' | 'OK' = 'OK';
      if (daysOfStock < 7) alert = 'LOW';
      else if (daysOfStock > 90) alert = 'OVERSTOCK';
      return {
        productId: p.id,
        productName: p.nameAr,
        currentStock: p.stock,
        weeklyDemand: Math.round(weeklyDemand),
        daysOfStock: Math.round(daysOfStock),
        alert,
        recommendation: alert === 'LOW' ? '🔁 أعد الطلب من المورّد' : alert === 'OVERSTOCK' ? '💡 شغّل عرض ترويجي' : '✅ لا إجراء',
      };
    });
    alerts.sort((a, b) => a.daysOfStock - b.daysOfStock);
    return {
      summary: {
        lowStockCount: alerts.filter((a) => a.alert === 'LOW').length,
        overstockCount: alerts.filter((a) => a.alert === 'OVERSTOCK').length,
        weeklyDemandTotal: alerts.reduce((s, a) => s + a.weeklyDemand, 0),
      },
      alerts,
    };
  }

  // ============ #8 Search Log Summarizer ============
  async searchSummary(days = 7) {
    const since = new Date(Date.now() - days * 86400000);
    const logs = await this.prisma.searchLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });
    const counts: Record<string, number> = {};
    const cats: Record<string, number> = {};
    for (const l of logs) {
      const k = l.query.trim().toLowerCase();
      if (!k) continue;
      counts[k] = (counts[k] || 0) + 1;
      if (/(حذاء|كعب)/.test(l.query)) cats['أحذية'] = (cats['أحذية'] || 0) + 1;
      if (/(ثوب|بدل|جاكيت)/.test(l.query)) cats['رجالي'] = (cats['رجالي'] || 0) + 1;
      if (/(فستان|عباي)/.test(l.query)) cats['نسائي'] = (cats['نسائي'] || 0) + 1;
      if (/(طفل)/.test(l.query)) cats['أطفال'] = (cats['أطفال'] || 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([query, count]) => ({ query, count }));
    const advice = top.length > 0
      ? `الكلمة الأكثر بحثاً: "${top[0].query}" (${top[0].count} مرة).`
      : 'لا توجد بيانات بحث كافية.';
    return { topQueries: top, categories: cats, advice, totalSearches: logs.length };
  }

  // ============ #9 Ad Copy Generator ============
  async adCopy(productId: string) {
    const p = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!p) throw new Error('Product not found');
    const price = Number(p.basePrice).toLocaleString('ar-EG');
    const old = p.oldPrice ? `(بدلاً من ${Number(p.oldPrice).toLocaleString('ar-EG')})` : '';
    const text = {
      facebook: `🔥 عرض أبو بشار الحصري!\n${p.nameAr}\n${old}\nالسعر الآن: ${price} ر.ي فقط\nتوصيل مجاني لشبوة/عتق\nاطلب الحين 👇`,
      whatsapp: `${p.nameAr} ✅\n${old ? 'السعر القديم ' + Number(p.oldPrice).toLocaleString('ar-EG') + ' | ' : ''}عرض اليوم ${price} ر.ي\nتوصيل مجاني شبوة/عتق\nللطلب راسلنا 👋`,
      instagram: `${p.nameAr} 🖤\n${old}\n✨ ${price} ر.ي\n#أبو_بشار #عروض #شبوة #ملابس`,
    };
    await this.prisma.adCopyTemplate.createMany({
      data: [
        { productId, channel: 'facebook', content: text.facebook },
        { productId, channel: 'whatsapp', content: text.whatsapp },
        { productId, channel: 'instagram', content: text.instagram },
      ],
    });
    return text;
  }
}