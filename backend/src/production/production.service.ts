import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
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

  // Pomocná metóda pre vykreslenie Wilsondo štítku
  private async drawWilsondoStickerContent(
    doc: PDFDocument,
    item: OrderItem,
    x: number,
    y: number,
    stickerWidth: number,
    stickerHeight: number,
    barcodeText: string,
    currentNumber: number,
  ) {
    const logoPath = join(
      __dirname,
      '../../../backend/assets/wilsondo-logo.png',
    );
    const fs = require('fs');

    // Vnútorný padding
    const padding = 6;

    // Logo Wilsondo - hore, väčšie
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, x + padding, y + padding, {
          fit: [stickerWidth - 2 * padding, 32],
          align: 'center',
        });
      }
    } catch (error) {
      console.error('Error loading Wilsondo logo:', error);
    }

    // Názov produktu - tesne pod logom
    const productName = item.product_name || '-';
    const productFontSize = productName.length > 25 ? 13 : 15;

    doc
      .font('Roboto-Bold')
      .fontSize(productFontSize)
      .text(productName, x + padding, y + 40, {
        width: stickerWidth - 2 * padding,
        align: 'center',
      });

    // Rozmery - tesne pod názvom
    doc
      .font('Roboto-Bold')
      .fontSize(15)
      .text(
        `${Math.round(item.length)}x${Math.round(item.width)}x${Math.round(item.height)}`,
        x + padding,
        y + 57,
        {
          width: stickerWidth - 2 * padding,
          align: 'center',
        },
      );

    // Počet - tesne pod rozmermi
    doc
      .font('Roboto')
      .fontSize(9)
      .text(`${currentNumber}/${item.quantity}`, x + padding, y + 75, {
        width: stickerWidth - 2 * padding,
        align: 'center',
      });

    // Poznámky - tesne pod počtom
    const notes = [item.label_1, item.label_2, item.label_3].filter(Boolean);
    if (notes.length > 0) {
      const notesText = notes.join(' | ');
      doc
        .font('Roboto')
        .fontSize(7)
        .text(notesText, x + padding, y + 89, {
          width: stickerWidth - 2 * padding,
          align: 'center',
        });
    }

    // Barcode s kódom - dole
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcodeText,
      scale: 1.6,
      height: 13,
      includetext: false,
      textxalign: 'center',
    });

    doc.image(barcodeBuffer, x + padding + 2, y + stickerHeight - 32, {
      width: stickerWidth - 2 * padding - 4,
      height: 13,
    });

    doc
      .font('Roboto')
      .fontSize(8)
      .text(barcodeText, x + padding, y + stickerHeight - 16, {
        width: stickerWidth - 2 * padding,
        align: 'center',
      });
  }

  // Pomocná metóda pre vykreslenie obsahu štítku
  private async drawStickerContent(
    doc: PDFDocument,
    item: OrderItem,
    x: number,
    y: number,
    stickerWidth: number,
    stickerHeight: number,
    barcodeText: string,
    currentNumber: number,
  ) {
    // Zákazník - horná časť
    doc
      .font('Roboto-Bold')
      .fontSize(10)
      .text(item.order?.customer?.podnik || '-', x + 5, y + 5, {
        width: stickerWidth - 10,
        align: 'center',
      });

    // Názov produktu - stredná časť
    const productName = item.product_name || '-';
    const productFontSize = productName.length > 25 ? 12 : 14;

    doc
      .font('Roboto-Bold')
      .fontSize(productFontSize)
      .text(productName, x + 5, y + 25, {
        width: stickerWidth - 10,
        align: 'center',
      });

    // Rozmery - pod produktom
    doc
      .font('Roboto-Bold')
      .fontSize(12)
      .text(
        `${Math.round(item.length)}x${Math.round(item.width)}x${Math.round(item.height)}`,
        x + 5,
        y + 45,
        {
          width: stickerWidth - 10,
          align: 'center',
        },
      );

    // Počet a ktorý je z počtu - menej výrazný
    doc
      .font('Roboto')
      .fontSize(7)
      .text(`${currentNumber}/${item.quantity}`, x + 5, y + 63, {
        width: stickerWidth - 10,
        align: 'center',
      });

    // Barcode s kódom pod ním - posunutý nižšie
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcodeText,
      scale: 1.5,
      height: 12,
      includetext: false,
      textxalign: 'center',
    });

    // Barcode - posunutý nižšie
    doc.image(barcodeBuffer, x + 10, y + 78, {
      width: stickerWidth - 20,
      height: 14,
    });

    // Kód pod barcode - posunutý nižšie
    doc
      .font('Roboto')
      .fontSize(9)
      .text(barcodeText, x + 5, y + 95, {
        width: stickerWidth - 10,
        align: 'center',
      });

    // Label informácie - na pravej strane štítku s väčšími rozostupmi
    if (item.label_1) {
      doc
        .font('Roboto')
        .fontSize(6)
        .text(`${item.label_1}`, x + stickerWidth - 25, y + 5, {
          width: 20,
          align: 'right',
        });
    }
    if (item.label_2) {
      doc
        .font('Roboto')
        .fontSize(6)
        .text(`${item.label_2}`, x + stickerWidth - 25, y + 18, {
          width: 20,
          align: 'right',
        });
    }
    if (item.label_3) {
      doc
        .font('Roboto')
        .fontSize(6)
        .text(`${item.label_3}`, x + stickerWidth - 25, y + 31, {
          width: 20,
          align: 'right',
        });
    }
  }

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

    // 1. Vytvor PDF dokument so štítkami - A4 s okrajmi pre tlačiareň
    const doc = new PDFDocument({
      size: 'A4',
      margin: 15, // väčšie okraje pre tlačiareň
      autoFirstPage: true,
    });

    const now1 = new Date();
    const dateStr1 =
      now1.getFullYear() +
      '-' +
      String(now1.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now1.getDate()).padStart(2, '0') +
      '_' +
      String(now1.getHours()).padStart(2, '0') +
      '-' +
      String(now1.getMinutes()).padStart(2, '0') +
      '-' +
      String(now1.getSeconds()).padStart(2, '0');

    const stitkyDir = join(__dirname, '../../../pdfs', 'stitky');

    // Ensure pdfs/stitky directory exists
    if (!existsSync(stitkyDir)) {
      mkdirSync(stitkyDir, { recursive: true });
    }

    const pdfPath = join(stitkyDir, `stitky-${dateStr1}.pdf`);

    const stream = createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.registerFont('Roboto', fontPath);
    doc.registerFont('Roboto-Bold', fontBoldPath);

    // Vylepšené rozmery štítkov - presne pre A4 s okrajmi
    const pageWidth = doc.page.width - 30; // 30 = 2x margin
    const pageHeight = doc.page.height - 30;

    const stickerWidth = Math.floor(pageWidth / 3); // presne 3 stĺpce
    const stickerHeight = Math.floor(pageHeight / 7); // presne 7 riadkov - väčšia výška

    let x = 15; // začiatok s okrajom
    let y = 15;

    for (const item of items) {
      // Skontroluj či je zákazník Wilsondo
      const isWilsondo = item.order?.customer?.podnik
        ?.toLowerCase()
        .includes('wilsondo');
      const currentStickerHeight = isWilsondo
        ? Math.floor(stickerHeight * 1.25)
        : stickerHeight;

      // Pre každý matrac vytvoríme presne 3 štítky vedľa seba (pre 3 pracoviská)
      for (let i = 1; i <= item.quantity; i++) {
        // Kontrola, či sa zmestí celý riadok 3 štítkov
        if (
          y + currentStickerHeight >
          doc.page.height - doc.page.margins.bottom
        ) {
          doc.addPage();
          x = 15; // začiatok s okrajom
          y = 15;
        }

        const drawMethod = isWilsondo
          ? this.drawWilsondoStickerContent.bind(this)
          : this.drawStickerContent.bind(this);

        // Nastavenie hrúbky ohraničenia
        if (isWilsondo) {
          doc.lineWidth(1.5);
        } else {
          doc.lineWidth(1);
        }

        // Prvý štítok v riadku
        const barcodeText1 = `${item.order?.order_number || '0'}-${item.id}-${i}-1`;
        doc.rect(x, y, stickerWidth, currentStickerHeight).stroke();
        // Obsah prvého štítku
        await drawMethod(
          doc,
          item,
          x,
          y,
          stickerWidth,
          currentStickerHeight,
          barcodeText1,
          i,
        );

        // Druhý štítok v riadku
        const barcodeText2 = `${item.order?.order_number || '0'}-${item.id}-${i}-2`;
        doc
          .rect(x + stickerWidth, y, stickerWidth, currentStickerHeight)
          .stroke();
        // Obsah druhého štítku
        await drawMethod(
          doc,
          item,
          x + stickerWidth,
          y,
          stickerWidth,
          currentStickerHeight,
          barcodeText2,
          i,
        );

        // Tretí štítok v riadku
        const barcodeText3 = `${item.order?.order_number || '0'}-${item.id}-${i}-3`;
        doc
          .rect(x + 2 * stickerWidth, y, stickerWidth, currentStickerHeight)
          .stroke();
        // Obsah tretieho štítku
        await drawMethod(
          doc,
          item,
          x + 2 * stickerWidth,
          y,
          stickerWidth,
          currentStickerHeight,
          barcodeText3,
          i,
        );

        // Vrátiť späť na normálnu hrúbku
        doc.lineWidth(1);

        // Presunieme sa na ďalší riadok pre ďalší matrac
        y += currentStickerHeight;
        x = 15; // začiatok ďalšieho riadku
      }
    }

    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));

    console.log(`✅ PDF bolo vygenerované: ${pdfPath}`);

    const summaryDoc = new PDFDocument({
      size: 'A4',
      margin: 25, // lepšie okraje pre tlač
      autoFirstPage: true,
    });
    const now = new Date();
    const dateStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      '_' +
      String(now.getHours()).padStart(2, '0') +
      '-' +
      String(now.getMinutes()).padStart(2, '0') +
      '-' +
      String(now.getSeconds()).padStart(2, '0');

    const prehladyDir = join(__dirname, '../../../pdfs', 'prehlady');

    // Ensure pdfs/prehlady directory exists
    if (!existsSync(prehladyDir)) {
      mkdirSync(prehladyDir, { recursive: true });
    }

    const summaryPath = join(prehladyDir, `prehlad-${dateStr}.pdf`);

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

    // Vylepšená hlavička prehľadu
    summaryDoc
      .font('Roboto-Bold')
      .fontSize(18)
      .text('PREHLAD VYROBY', { align: 'center' })
      .moveDown(0.5);

    summaryDoc
      .font('Roboto')
      .fontSize(12)
      .text(`Datum generovania: ${new Date().toLocaleDateString('sk-SK')}`, {
        align: 'center',
      })
      .moveDown(1);

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
            new Date(item.order?.issue_date).toLocaleDateString('sk-SK'),
          ),
        ),
      ].join(', ');

      // Vylepšený zákazník header
      summaryDoc
        .font('Roboto-Bold')
        .fontSize(16)
        .text(`${customer}`, { underline: true })
        .moveDown(0.3);

      summaryDoc
        .font('Roboto')
        .fontSize(11)
        .text(`Objednavky: ${orderNumbers}`, { continued: true })
        .text(` | Datumy: ${issueDates}`);

      summaryDoc.moveDown(0.8);

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
          {
            label: 'Produkt',
            property: 'produkt',
            width: 100,
            align: 'left',
          },
          {
            label: 'Tech. Vyska',
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
            label: 'Material',
            property: 'material',
            width: 80,
            align: 'center',
          },
          {
            label: 'Mnozstvo',
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
            label: 'Plast',
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
