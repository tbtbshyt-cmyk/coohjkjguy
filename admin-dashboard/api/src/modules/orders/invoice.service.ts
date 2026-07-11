import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(orderId: string): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true },
    });
    if (!order) throw new NotFoundException();

    // Generate QR payload
    const qrPayload = JSON.stringify({
      store: 'أبو بشار',
      order: order.orderNumber,
      customer: order.customerName,
      phone: order.customerPhone,
      total: Number(order.total),
      date: order.createdAt.toISOString(),
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 220 });

    return new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.rect(0, 0, doc.page.width, 80).fill('#0A0A0A');
      doc.fillColor('#D4AF37').fontSize(24).text('ABU BISHAR', 40, 28);
      doc.fillColor('#FFF').fontSize(10).text('Invoice / فاتورة', 40, 56);
      doc.fontSize(14).text(`#${order.orderNumber}`, doc.page.width - 40, 28, { align: 'right' });
      doc.fontSize(9).text(order.createdAt.toLocaleString('en-GB'), doc.page.width - 40, 50, { align: 'right' });

      // Body
      doc.fillColor('#000').fontSize(11);
      doc.font('Helvetica-Bold').text('Bill To / الفاتورة إلى:', 40, 110);
      doc.font('Helvetica').fontSize(10);
      doc.text(order.customerName, 40, 128);
      doc.text(`Phone: ${order.customerPhone}`, 40, 144);
      if (order.customerEmail) doc.text(`Email: ${order.customerEmail}`, 40, 160);
      doc.text(`City: ${order.customerCity}`, 40, 176);
      doc.text(`Address: ${order.customerAddress}`, 40, 192, { width: 350 });

      // QR
      doc.image(qrDataUrl, doc.page.width - 180, 110, { width: 110 });

      // Items table
      let y = 250;
      doc.rect(40, y, doc.page.width - 80, 24).fill('#D4AF37');
      doc.fillColor('#000').font('Helvetica-Bold').fontSize(10);
      doc.text('Item', 50, y + 8);
      doc.text('Size', 280, y + 8);
      doc.text('Qty', 380, y + 8);
      doc.text('Price', 460, y + 8);
      doc.text('Total', doc.page.width - 50, y + 8, { align: 'right' });

      y += 30;
      doc.font('Helvetica').fillColor('#222');
      for (const item of order.items) {
        doc.text(item.productName.slice(0, 40), 50, y);
        doc.text(item.size || '-', 280, y);
        doc.text(String(item.quantity), 380, y);
        doc.text(Number(item.unitPrice).toLocaleString('en-US'), 460, y);
        doc.text(Number(item.totalPrice).toLocaleString('en-US'), doc.page.width - 50, y, { align: 'right' });
        y += 22;
      }

      // Totals
      y += 10;
      doc.moveTo(doc.page.width - 240, y).lineTo(doc.page.width - 40, y).strokeColor('#D4AF37').stroke();
      y += 18;
      const row = (l: string, v: string, bold = false) => {
        if (bold) doc.font('Helvetica-Bold'); else doc.font('Helvetica');
        doc.text(l, doc.page.width - 240, y);
        doc.text(v, doc.page.width - 50, y, { align: 'right' });
        y += 16;
      };
      row('Subtotal', Number(order.subtotal).toLocaleString('en-US'));
      if (Number(order.discount) > 0) row('Discount', '-' + Number(order.discount).toLocaleString('en-US'));
      row('Shipping', Number(order.shipping) === 0 ? 'FREE' : Number(order.shipping).toLocaleString('en-US'));
      y += 4;
      doc.rect(doc.page.width - 260, y - 12, 220, 28).fill('#D4AF37');
      doc.fillColor('#000').font('Helvetica-Bold').fontSize(12);
      doc.text('TOTAL', doc.page.width - 240, y + 6);
      doc.text(Number(order.total).toLocaleString('en-US'), doc.page.width - 50, y + 6, { align: 'right' });

      doc.end();
    });
  }
}