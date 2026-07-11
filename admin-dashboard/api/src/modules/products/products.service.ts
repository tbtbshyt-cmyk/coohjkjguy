import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/create-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(q: ProductQueryDto) {
    const page = Math.max(1, q.page || 1);
    const limit = Math.min(50, q.limit || 20);

    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      ...(q.category && { category: { slug: q.category.toUpperCase() as any } }),
      ...(q.brand && { brand: { name: q.brand } }),
      ...(q.featured && { isFeatured: true }),
      ...(q.flash && { isFlashSale: true }),
      ...(q.minPrice && { basePrice: { gte: q.minPrice } }),
      ...(q.maxPrice && { basePrice: { lte: q.maxPrice } }),
      ...(q.q && {
        OR: [
          { nameAr:   { contains: q.q, mode: 'insensitive' } },
          { nameEn:   { contains: q.q, mode: 'insensitive' } },
          { tags:     { has: q.q } },
          { descriptionAr: { contains: q.q, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      q.sort === 'priceAsc'  ? { basePrice: 'asc' }  :
      q.sort === 'priceDesc' ? { basePrice: 'desc' } :
      q.sort === 'best'      ? { soldCount: 'desc' } :
                                { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: {
          category: { select: { id: true, slug: true, nameAr: true } },
          brand: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 5 },
          reviews: { select: { rating: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const data = items.map((p) => this.serialize(p, q.locale));
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    };
  }

  async featured(limit = 8) {
    const items = await this.prisma.product.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      take: limit,
      include: {
        category: { select: { slug: true, nameAr: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { soldCount: 'desc' },
    });
    return { data: items.map((p) => this.serialize(p)) };
  }

  async flashSale() {
    const items = await this.prisma.product.findMany({
      where: { status: 'PUBLISHED', isFlashSale: true },
      include: {
        category: { select: { slug: true, nameAr: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: items.map((p) => this.serialize(p)) };
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { active: true } },
        reviews: { where: { approved: true }, take: 20, orderBy: { createdAt: 'desc' }, include: { customer: { select: { fullName: true } } } },
      },
    });
    if (!product) throw new NotFoundException('المنتج غير موجود');
    await this.prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } });

    const recommendations = await this.prisma.productRecommendation.findMany({
      where: { sourceId: product.id },
      include: { target: { include: { images: { take: 1 }, category: true } } },
      orderBy: { score: 'desc' },
      take: 6,
    });
    return { data: { ...this.serialize(product), recommendations: recommendations.map((r) => this.serialize(r.target)) } };
  }

  async getRecommendations(productId: string, k = 4) {
    const recs = await this.prisma.productRecommendation.findMany({
      where: { sourceId: productId },
      orderBy: { score: 'desc' },
      take: k,
      include: { target: { include: { images: { take: 1 }, category: true } } },
    });
    return { data: recs.map((r) => this.serialize(r.target)) };
  }

  // -------- ADMIN --------

  async adminList(page = 1, limit = 50, q?: string) {
    const where: Prisma.ProductWhereInput = q ? {
      OR: [
        { nameAr: { contains: q, mode: 'insensitive' } },
        { sku:   { contains: q, mode: 'insensitive' } },
        { slug:  { contains: q, mode: 'insensitive' } },
      ],
    } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true, brand: true, images: { take: 1 } },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async adminGet(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, category: true, brand: true },
    });
    if (!p) throw new NotFoundException();
    return p;
  }

  async adminCreate(dto: CreateProductDto, userId: string) {
    const product = await this.prisma.product.create({ data: dto });
    await this.audit.log({
      userId, action: 'CREATE', resource: 'product', resourceId: product.id,
      afterData: product as any,
    });
    return product;
  }

  async adminUpdate(id: string, dto: UpdateProductDto, userId: string) {
    const before = await this.prisma.product.findUnique({ where: { id } });
    if (!before) throw new NotFoundException();
    const after = await this.prisma.product.update({ where: { id }, data: dto });
    await this.audit.log({
      userId, action: 'UPDATE', resource: 'product', resourceId: id,
      beforeData: before as any, afterData: after as any,
    });
    return after;
  }

  async adminDelete(id: string, userId: string) {
    const before = await this.prisma.product.findUnique({ where: { id } });
    if (!before) throw new NotFoundException();
    await this.prisma.product.delete({ where: { id } });
    await this.audit.log({
      userId, action: 'DELETE', resource: 'product', resourceId: id,
      beforeData: before as any,
    });
    return { deleted: true, id };
  }

  async adminBulkImport(rows: any[], userId: string) {
    const job = await this.prisma.bulkImportJob.create({
      data: {
        type: 'products',
        filename: `bulk-${Date.now()}.csv`,
        totalRows: rows.length,
        status: 'PROCESSING',
        triggeredBy: userId,
      },
    });
    let success = 0;
    let failed = 0;
    const errors: any[] = [];
    for (const row of rows) {
      try {
        await this.prisma.product.upsert({
          where: { sku: row.sku },
          create: row,
          update: row,
        });
        success++;
      } catch (e: any) {
        failed++;
        errors.push({ sku: row.sku, error: e.message });
      }
    }
    await this.prisma.bulkImportJob.update({
      where: { id: job.id },
      data: {
        successRows: success, failedRows: failed, errors,
        status: failed === 0 ? 'COMPLETED' : 'COMPLETED',
        completedAt: new Date(),
      },
    });
    return { jobId: job.id, success, failed, errors };
  }

  // -------- SERIALIZER --------
  private serialize(p: any, locale?: string) {
    const reviews = p.reviews || [];
    const reviewCount = reviews.length;
    const rating = reviewCount > 0
      ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

    return {
      id: p.id,
      sku: p.sku,
      slug: p.slug,
      name: locale === 'en' && p.nameEn ? p.nameEn : p.nameAr,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      description: locale === 'en' && p.descriptionEn ? p.descriptionEn : p.descriptionAr,
      basePrice: Number(p.basePrice),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      discountPercent: p.oldPrice
        ? Math.round(((Number(p.oldPrice) - Number(p.basePrice)) / Number(p.oldPrice)) * 100)
        : 0,
      currency: 'YER',
      category: p.category && { id: p.category.id, slug: p.category.slug, nameAr: p.category.nameAr },
      brand: p.brand && { id: p.brand.id, name: p.brand.name },
      sizes: p.sizes || [],
      colors: p.colors || [],
      tags: p.tags || [],
      stock: p.stock,
      soldCount: p.soldCount,
      rating,
      reviewCount,
      isFeatured: p.isFeatured,
      isFlashSale: p.isFlashSale,
      isNewArrival: p.isNewArrival,
      images: (p.images || []).map((i: any) => ({
        id: i.id,
        url: i.url,
        webpUrl: i.webpUrl || i.url,
        blurhash: i.blurhash,
        width: i.width,
        height: i.height,
        isPrimary: i.isPrimary,
      })),
      createdAt: p.createdAt,
    };
  }
}