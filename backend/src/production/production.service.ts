import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { NotFoundException } from '@nestjs/common';
import * as bwipjs from 'bwip-js';
import PDFDocument from 'pdfkit-table';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async getPendingItems() {
    const items = await this.orderItemRepo.find({
      where: [
        { status: 'pending', order: { id: Not(IsNull()) } },
        { status: 'to-production', order: { id: Not(IsNull()) } },
      ],
      relations: ['order', 'order.customer'],
    });

    return items;
  }
  async processScan(orderNumber: string, itemId: number) {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId, order: { order_number: orderNumber } },
      relations: ['order'],
    });

    if (!item) {
      throw new NotFoundException('Položka nenájdená.');
    }

    // Zvýšime počet vyrobených kusov o 1
    item.count = (item.count || 0) + 1;

    // Ak počet vyrobených kusov dosiahne množstvo, aktualizujeme stav
    if (item.count >= item.quantity) {
      item.status = 'completed';
    }

    await this.orderItemRepo.save(item);

    return {
      message: `Sken úspešný. ${item.product_name} (${item.count}/${item.quantity})`,
      order_number: item.order.order_number,
      product_name: item.product_name,
      produced_count: item.count,
      quantity: item.quantity,
      status: item.status,
    };
  }

  async moveAllToInProduction() {
    const items = await this.orderItemRepo.find({
      where: { status: 'to-production' },
      relations: ['order', 'order.customer'],
    });

    if (items.length === 0) {
      return { message: 'Žiadne položky na výrobu.' };
    }
    const fontPath = join(__dirname, '../../../fonts/Roboto-Regular.ttf');
    const fontBoldPath = join(__dirname, '../../../fonts/Roboto-Bold.ttf');
    // 1. Vytvor PDF dokument so štítkami
    const doc = new PDFDocument({ size: 'A4', margin: 10 });
    const pdfPath = join(
      __dirname,
      '../../../pdfs',
      `stitky-${Date.now()}.pdf`,
    );
    const stream = createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.registerFont('Roboto', fontPath);
    doc.registerFont('Roboto-Bold', fontBoldPath);

    const stickerWidth = 200;
    const stickerHeight = 100; // aby sa ich zmestilo 8 na výšku
    const marginX = 0;
    const marginY = 0;
    const stickersPerRow = 3;

    let x = marginX;
    let y = marginY;
    let counter = 0;

    for (const item of items) {
      for (let i = 1; i <= item.quantity; i++) {
        const barcodeText = `${item.order?.order_number || '0'}-${item.id}-${i}`;

        if (y + stickerHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          x = marginX;
          y = marginY;
        }

        doc.rect(x, y, stickerWidth, stickerHeight).stroke();

        doc
          .font('Roboto-Bold')
          .fontSize(14)
          .text(item.order?.customer?.podnik || '-', x + 5, y + 5, {
            width: stickerWidth - 10,
            align: 'center',
          });

        doc
          .font('Roboto')
          .fontSize(12)
          .text(item.product_name, x + 5, y + 25, {
            width: stickerWidth - 10,
            align: 'center',
          });

        doc
          .font('Roboto')
          .fontSize(10)
          .text(
            `${Math.round(item.length)}x${Math.round(item.width)}x${Math.round(item.height)}` ||
              '-',
            x + 5,
            y + 42,
            {
              width: stickerWidth - 10,
              align: 'center',
            },
          );

        doc
          .font('Roboto')
          .fontSize(8)
          .text(
            `Dátum: ${new Date().toLocaleDateString('sk-SK')}`,
            x + 5,
            y + 60,
            {
              width: (stickerWidth - 10) / 2,
              align: 'left',
            },
          );

        doc
          .font('Roboto')
          .fontSize(8)
          .text(
            `ID: ${item.id} | ${i}/${item.quantity}`,
            x + 5 + (stickerWidth - 10) / 2,
            y + 60,
            {
              width: (stickerWidth - 10) / 2,
              align: 'right',
            },
          );

        if (item.label_1) {
          doc
            .font('Roboto')
            .fontSize(8)
            .text(`${item.label_1}`, x + 5 + (stickerWidth - 10) / 2, y + 20, {
              width: (stickerWidth - 10) / 2,
              align: 'right',
            });
        }
        if (item.label_2) {
          doc
            .font('Roboto')
            .fontSize(8)
            .text(`${item.label_2}`, x + 5 + (stickerWidth - 10) / 2, y + 28, {
              width: (stickerWidth - 10) / 2,
              align: 'right',
            });
        }
        if (item.label_3) {
          doc
            .font('Roboto')
            .fontSize(8)
            .text(`${item.label_3}`, x + 5 + (stickerWidth - 10) / 2, y + 36, {
              width: (stickerWidth - 10) / 2,
              align: 'right',
            });
        }

        const barcodeBuffer = await bwipjs.toBuffer({
          bcid: 'code128',
          text: barcodeText,
          scale: 2,
          height: 16,
          includetext: true,
          textxalign: 'center',
          textsize: 10,
        });

        doc.image(barcodeBuffer, x + 30, y + 74, {
          width: stickerWidth - 60,
          height: 16,
        });

        counter++;
        x += stickerWidth + marginX;
        if (counter % stickersPerRow === 0) {
          x = marginX;
          y += stickerHeight + marginY; // 🔁 UPRAVENÉ posunutie o väčšiu výšku
        }
      }
    }

    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));

    console.log(`✅ PDF bolo vygenerované: ${pdfPath}`);

    const summaryDoc = new PDFDocument({ size: 'A4', margin: 40 });
    const summaryPath = join(
      __dirname,
      '../../../pdfs',
      `prehlad-${Date.now()}.pdf`,
    );
    const summaryStream = createWriteStream(summaryPath);
    summaryDoc.pipe(summaryStream);

    summaryDoc.registerFont('Roboto', fontPath);
    summaryDoc.registerFont('Roboto-Bold', fontBoldPath);

    const groupedItems = items.reduce(
      (acc, item) => {
        const customer = item.order?.customer?.podnik || 'Neznámy zákazník';
        if (!acc[customer]) acc[customer] = [];
        acc[customer].push(item);
        return acc;
      },
      {} as Record<string, OrderItem[]>,
    );

    summaryDoc.font('Roboto');

    for (const [customer, customerItems] of Object.entries(groupedItems)) {
      if (summaryDoc.y > summaryDoc.page.height - 150) summaryDoc.addPage();

      const orderNumbers = [
        ...new Set(
          customerItems.map((item) => item.order?.order_number || '-'),
        ),
      ].join(', ');
      const issueDates = [
        ...new Set(
          customerItems.map((item) =>
            new Date(item.order?.issue_date).toLocaleDateString(),
          ),
        ),
      ].join(', ');

      summaryDoc
        .font('Roboto-Bold')
        .fontSize(14)
        .text(customer, { underline: true })
        .fontSize(10)
        .font('Roboto')
        .text(`Objednávky: ${orderNumbers}`, { continued: true })
        .text(` | Dátumy: ${issueDates}`);

      summaryDoc.moveDown(0.5);

      const tableData = customerItems.map((item) => ({
        produkt: item.product_name,
        tech: item.tech_width ? `${Math.round(item.tech_width)}` : '-',
        rozmery: `${Math.round(Number(item.length))} x ${Math.round(Number(item.width))} x ${Math.round(Number(item.height))}`,
        material: item.material_name || '-',
        mnozstvo: item.quantity.toString(),
        poznamka_jadro: item.notes_core || '-',
        poznamka_plast: item.notes_cover || '-',
      }));

      const table = {
        headers: [
          { label: 'Produkt', property: 'produkt', width: 100, align: 'left' },
          {
            label: 'Tech. Výška',
            property: 'tech',
            width: 60,
            align: 'center',
          },
          {
            label: 'Rozmery',
            property: 'rozmery',
            width: 100,
            align: 'center',
          },
          {
            label: 'Materiál',
            property: 'material',
            width: 80,
            align: 'center',
          },
          {
            label: 'Množstvo',
            property: 'mnozstvo',
            width: 60,
            align: 'center',
          },
          {
            label: 'Jadro',
            property: 'poznamka_jadro',
            width: 55,
            align: 'left',
          },
          {
            label: 'Plášť',
            property: 'poznamka_plast',
            width: 60,
            align: 'left',
          },
        ],
        datas: tableData,
      };

      await summaryDoc.table(table, {
        prepareHeader: () => summaryDoc.font('Roboto-Bold').fontSize(10),
        prepareRow: () => summaryDoc.font('Roboto').fontSize(9),
        columnsSize: [100, 60, 100, 80, 60, 55, 60],
        padding: [5, 5, 5, 5],
      });

      if (summaryDoc.y > summaryDoc.page.height - 80) summaryDoc.addPage();

      summaryDoc
        .moveTo(summaryDoc.page.margins.left, summaryDoc.y)
        .lineTo(
          summaryDoc.page.width - summaryDoc.page.margins.right,
          summaryDoc.y,
        )
        .strokeColor('#cccccc')
        .lineWidth(0.5)
        .stroke();

      summaryDoc.moveDown();
    }

    summaryDoc.end();
    await new Promise((resolve) => summaryStream.on('finish', resolve));

    console.log(`✅ PDF prehľad: ${summaryPath}`);

    for (const item of items) {
      item.status = 'in-production';
    }
    await this.orderItemRepo.save(items);

    return {
      message: 'Všetky položky boli zaradené do výroby a PDF bolo vytvorené.',
      pdfPath,
      summaryPath,
    };
  }
}
