import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as crypto from 'crypto';
import * as sharp from 'sharp';

@Injectable()
export class VisualSearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Compute a 64-bit perceptual hash (pHash) from a 32x32 grayscale image.
   * Then find nearest matches by Hamming distance in DB.
   */
  async search(file: Express.Multer.File) {
    // 1) Compute pHash
    const buffer = await sharp(file.buffer)
      .resize(32, 32, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();

    // DCT-lite: compare each pixel to median (instead of full DCT, fast enough for demo)
    const sorted = [...buffer].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const bits = buffer.map((b) => (b >= median ? '1' : '0')).join('');

    // 2) Search in DB by Hamming distance (brute-force; OK for ≤10k products)
    const allImages = await this.prisma.productImage.findMany({
      where: { phash: { not: null } },
      include: { product: { include: { images: { take: 1 }, category: true } } },
      take: 5000,
    });

    const scored = allImages.map((img) => ({
      img,
      distance: this.hamming(bits, img.phash || ''),
    }));

    const matches = scored
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8)
      .map((s) => ({
        product: s.img.product,
        score: Math.max(0, 1 - s.distance / 64),
        reason: 'visual_similarity',
      }));

    // 3) Log search
    await this.prisma.visualSearch.create({
      data: {
        uploadedImage: `data:${file.mimetype};base64,${file.buffer.toString('base64').slice(0, 200)}...`,
        phash: bits,
        results: matches as any,
      },
    });

    return { matches, searchId: `vs_${Date.now()}`, duration: 0 };
  }

  /** Pre-compute pHash for all product images (one-time migration) */
  async reindexAll() {
    const images = await this.prisma.productImage.findMany({ where: { phash: null } });
    let count = 0;
    for (const img of images) {
      try {
        const res = await fetch(img.url);
        const buf = Buffer.from(await res.arrayBuffer());
        const buffer = await sharp(buf).resize(32, 32).grayscale().raw().toBuffer();
        const sorted = [...buffer].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const bits = buffer.map((b) => (b >= median ? '1' : '0')).join('');
        await this.prisma.productImage.update({ where: { id: img.id }, data: { phash: bits } });
        count++;
      } catch {}
    }
    return { reindexed: count, total: images.length };
  }

  private hamming(a: string, b: string): number {
    let d = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) if (a[i] !== b[i]) d++;
    return d + Math.abs(a.length - b.length);
  }
}