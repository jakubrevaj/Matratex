/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Get, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Response } from 'express';
import * as QRCode from 'qrcode';

(pdfMake as any).vfs = (pdfFonts as any).vfs;

type ProductionStatus = 'pending' | 'in-production' | 'completed' | 'invoiced';

@Injectable()
export class InvoicesService {
  prisma: any;
  async findAll() {
    const invoices = await this.invoiceRepo.find({
      order: {
        created_at: 'DESC',
      },
    });

    return invoices.map((inv) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      customer_name: inv.customer_name ?? 'Neznámy zákazník',
      total_price: inv.total_price,
      created_at: inv.created_at,
      order_number: inv.order_number ?? '-', // ← použiješ tu
    }));
  }

  invoicesService: any;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  @Get()
  getAllInvoices() {
    return this.invoicesService.findAll();
  }

  async createInvoiceForCompletedItems(orderId: number): Promise<Invoice> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['order_items', 'customer'],
    });

    if (!order) {
      throw new Error('Objednávka neexistuje.');
    }

    const completedItems = order.order_items.filter(
      (item) => item.status === 'completed',
    );

    if (completedItems.length === 0) {
      throw new Error('Žiadne dokončené položky na fakturáciu.');
    }

    completedItems.forEach((item) => {
      item.status = 'invoiced';
    });

    await this.orderItemRepo.save(completedItems);

    const year = new Date().getFullYear();

    const lastInvoice = await this.invoiceRepo.findOne({
      where: { invoice_number: Like(`${year}%`) },
      order: { invoice_number: 'DESC' },
    });

    let nextNumber = 1;

    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoice_number.slice(4), 10);
      nextNumber = lastNumber + 1;
    }

    const invoiceNumber = `${year}${String(nextNumber).padStart(4, '0')}`;

    const totalPrice = completedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const itemsSnapshot = completedItems.map((item) => ({
      name: item.product_name || '-',
      material: '-',
      dimensions: `${Math.round(item.length)}x${Math.round(item.width)}x${Math.round(item.height)} cm`,
      quantity: item.quantity,
      unit_price: Number(item.price),
      total_price: Number(item.price) * item.quantity,
      notes_core: item.notes_core,
      notes_cover: item.notes_cover,
    }));

    const invoice = this.invoiceRepo.create({
      invoice_number: invoiceNumber,
      orderId: order.id, // ✅ DOPLN TOTO!
      order_number: order.order_number, // ✅ pridaj sem
      total_price: totalPrice,
      notes: '',
      customer_name: order.customer?.podnik ?? 'Neznámy zákazník',
      customer_address: order.customer?.adresa ?? '',
      customer_ico: order.customer?.ico ? order.customer.ico : undefined,
      issued_by: 'M. Macková',
      issue_date: new Date(),
      due_date: new Date(),
      variable_symbol: invoiceNumber.replace(/\D/g, ''),
      items: itemsSnapshot,
    });

    await this.invoiceRepo.save(invoice);

    order.production_status = this.computeProductionStatus(order.order_items);
    await this.orderRepo.save(order);

    return invoice;
  }

  async createInvoice(orderId: number): Promise<Invoice> {
    return this.createInvoiceForCompletedItems(orderId);
  }

  async getInvoiceById(id: number): Promise<Invoice | null> {
    return await this.invoiceRepo.findOne({ where: { id } });
  }

  async generateInvoicePdf(
    invoiceId: number,
    res: Response,
    withVatQuery?: string,
  ): Promise<void> {
    const withVat = withVatQuery !== 'false';
    const bysquare = await import('bysquare');
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Faktúra neexistuje.');
    }

    const amount = withVat
      ? parseFloat((invoice.total_price * 1.23).toFixed(2))
      : parseFloat(invoice.total_price.toFixed(2));

    const qrData = {
      payments: [
        {
          type: 1 as const,
          bankAccounts: [
            {
              iban: 'SK2202000000001572951551',
            },
          ],
          amount,
          currencyCode: 'EUR',
          variableSymbol: invoice.variable_symbol,
          note: `Úhrada faktúry č. ${invoice.invoice_number} (${invoice.customer_name})`,
          paymentDueDate: new Date().toISOString().split('T')[0],
        },
      ],
    };

    const payBySquareCode = bysquare.generate(qrData);
    const qrCode = await QRCode.toDataURL(payBySquareCode);

    const itemsTable = [
      withVat
        ? [
            { text: 'Názov', bold: true },
            { text: 'Rozmer', bold: true },
            { text: 'Množstvo', bold: true },
            { text: 'Cena bez DPH', bold: true },
            { text: 'DPH 23%', bold: true },
            { text: 'Cena s DPH', bold: true },
          ]
        : [
            { text: 'Názov', bold: true },
            { text: 'Rozmer', bold: true },
            { text: 'Množstvo', bold: true },
            { text: 'Cena (€)', bold: true },
          ],
      ...invoice.items.map((item) => {
        const basePrice =
          typeof item.unit_price === 'number'
            ? item.unit_price * (item.quantity ?? 1)
            : typeof item.total_price === 'number'
              ? item.total_price
              : 0;

        const vat = basePrice * 0.23;
        const totalWithVat = basePrice + vat;

        return withVat
          ? [
              item.name || '-',
              item.dimensions || '-',
              `${item.quantity ?? 1} ks`,
              `${basePrice.toFixed(2)} €`,
              `${vat.toFixed(2)} €`,
              `${totalWithVat.toFixed(2)} €`,
            ]
          : [
              item.name || '-',
              item.dimensions || '-',
              `${item.quantity ?? 1} ks`,
              `${basePrice.toFixed(2)} €`,
            ];
      }),
    ];

    const docDefinition: any = {
      content: [
        {
          columns: [
            {
              image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA7gAAAKACAYAAAC2Z9QvAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6QMfCRAvXIfJdAAAgABJREFUeNrs3XeALOlZ3/vv875V3XPO2T2btEE5rFY5oYAEIggEWAaMyUk4ICzBJRrsC7bvBWxzAYPvtQ22LxhfjG0cAJNNMFlgBJKMEopIQkhaxc1Bu+fMdNX73D+equ6emZ45EzrNnN9H6p05PTPdVdVVb73PG54XRERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERETg1b9QaIiIiIiIjI2rgKGAAV0AIF2ATuX/WGHYQCXBERERERkcvXo4FnA88DbgYeA1zNJMDdAu4EPgS8A3g98Hbg3ave8FkU4IqIiIiIiFxengB8IvBC4LnAo4aZawFKiV9wB7P4inXfF2gmwe4bgNcCfwC8edU7JCIiIiIiIpeXZwLfDbxukCqvbOApDRyyQ3JLyc2se+CAp5QcM7ecnGROSk5K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g+Jaq1Ip+3MaX+Lptfhn6E0MHQ6nzOzcbh/I8IJHs5YLwGX8M/Qp/PPzbrxj4XG8k0EO1/348eDz8ePDq4C7gFONcXvN8ujqsunbHPtrUJZSeg5/T1/A38NP4Snav4gfJ57kxjjm344fV+8H3lL24SvKdeeAW4Nx56pj6vbj4aNYbxhFfwoPMp7GA9r344XSPomP0t7QgYfIUVCAK3LzOYVnPdyGL+9yPz4qejfeCLoD75WtPbFz4BLeiHkWT9N/EB+5eAqfH3QjNG6ud/fiAcu9eO/6S/H3s/YY197iBFzBG1dP4wHH4+XyKP5+PoeC2ZvRKfy7fwp4MX58eAl+TKiN/A2GLJYZ3sn1GPAEnmr8cPn3ea6dlMqb3T34seHFeMD2Uvx4fz+eal1HyTr8WP8Mfmx4Bj8mPI6/r8+Vy0Fn5VzLzuHfidsYjqf1vHkaOIt/P07gGUV1NLOONJ7H9+N5hs7fR/Bz6fPlcvG4N1LkRqMAV0SW1WBoWHtGJ2AREZFVTrGYTgtDoS0RERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERGRo2XH/QL26S7gncCXABvAg8AvA78IfBy4eNwvUERERERERI7G9R7g/hXga2+Fe7qyNW2GFh4FHgI+AvwC8H7gY8BnjvsFi4iIiNzkTgMNEMrFGNqkU+AO4Gz5W70d5TZ56bEicKrc/kS5TVq6Xf13vT4AM+BJ4IXR38KK50jlMgeeAS4AbblNBrry9/rzuePeuSI3u+s9wP27t8LXdxidGTkE2tQSY8DaRCiHqBk8CzyOj+r+MvAB4EPAI3gwLCIiIiKDM8AEDxqneCB5olwa4CRwOx5YTsp158r96m2m5e+nyv1Teexby6Up14+D3AbPypsAceLB8JHYrlE884zAGuTOys9xYNsCm8Cl8vca/M7wgPhS+XsGLgNPj667AjxW/j0fXTcb/V7/puBZZBeu9wD3jcDf2IAvznHCLPlxMzQR2hZyxshY2UrLvsHlQPUkPqL7aeBTwEfL5eHyNxEREZHr3TmGwPQEHoDehgeQt5efdQS0BrR3lJ8n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nS/9u6b9zvBA8xI+glqD0efwdN/nyu/P449/ZXSfdvR4LaosLCIiIrInCnBFbj6n8e9+DWjD6Pe6/NIJPPCtAe+t5X4bo/vVIPtWhnnKGwwBMuWxx4HztFzq49Tnht0dj/KK38eBZ4cHis/jQWO9rv49MQSldeSzBp0zFgPMebn+Urmu1F9ixpDiWx8rjS4Zpf2KiIiIHAsFuCJy3E4dwGMooBQREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREROQj/f3Udz/cXXc9yAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI1LTAzLTMxVDA5OjE2OjMxKzAwOjAwekx0tgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNS0wMy0zMVQwOToxNjozMSswMDowMAsRzAoAAAAASUVORK5CYII=', // tvoje logo

              width: 120,
              alignment: 'left',
            },
            {
              text: `FAKTÚRA ${invoice.invoice_number}`,
              alignment: 'center',
              bold: true,
              fontSize: 16,
              margin: [0, 15, 0, 0],
            },
            {
              image: qrCode,
              width: 70,
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: '33%',
              stack: [
                {
                  text: 'DODÁVATEĽ',
                  style: 'tableHeaderBlue',
                  margin: [0, 0, 0, 5],
                },
                { text: 'Matratex s.r.o.', fontSize: 9 },
                { text: 'Príkladná 123, 01001 Žilina', fontSize: 9 },
                { text: 'IČO: 12345678   DIČ: 87654321', fontSize: 9 },
                { text: 'IČ DPH: SK1234567890', fontSize: 9 },
                { text: 'info@matratex.sk', fontSize: 9 },
              ],
            },
            {
              width: '33%',
              stack: [
                {
                  text: 'ODBERATEĽ',
                  style: 'tableHeaderBlue',
                  margin: [0, 0, 0, 5],
                },
                { text: invoice.customer_name, fontSize: 9 },
                { text: invoice.customer_address || '', fontSize: 9 },
                ...(invoice.customer_ico
                  ? [{ text: `IČO: ${invoice.customer_ico}`, fontSize: 9 }]
                  : []),
              ],
            },
            {
              width: '33%',
              stack: [
                {
                  text: `Dátum vystavenia: ${new Date(invoice.issue_date).toLocaleDateString()}`,
                  fontSize: 9,
                },
                {
                  text: `Dátum dodania: ${new Date(invoice.issue_date).toLocaleDateString()}`,
                  fontSize: 9,
                },
                {
                  text: `Splatnosť: ${new Date(invoice.due_date || invoice.issue_date).toLocaleDateString()}`,
                  bold: true,
                  fontSize: 9,
                },
              ],
            },
          ],
          columnGap: 20,
          margin: [0, 0, 0, 10],
        },

        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  columns: [
                    {
                      stack: [
                        {
                          text: `K úhrade: ${
                            withVat
                              ? (Number(invoice.total_price) * 1.23).toFixed(2)
                              : Number(invoice.total_price).toFixed(2)
                          } €`,
                          bold: true,
                          color: 'white',
                          fontSize: 12,
                          margin: [5, 2, 0, 2],
                        },
                        {
                          text: `Variabilný symbol: ${invoice.variable_symbol}`,
                          color: 'white',
                          bold: true,
                          fontSize: 11,
                          margin: [5, 10, 0, 0],
                        },
                        {
                          text: `IBAN: SK12 3456 7890 1234 5678 9012`,
                          color: 'white',
                          bold: true,
                          fontSize: 11,
                          margin: [5, 0, 0, 0],
                        },
                      ],
                      width: '70%',
                    },
                    {
                      image: qrCode,
                      width: 60,
                      alignment: 'right',
                      margin: [0, 0, 10, 0],
                    },
                  ],
                },
              ],
            ],
          },
          layout: {
            fillColor: () => '#69a5fe',
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingTop: () => 8,
            paddingBottom: () => 8,
          },
          margin: [0, 10, 0, 0],
        },
        { text: 'Položky', style: 'subheader', margin: [0, 20, 0, 5] },
        {
          table: {
            widths: withVat
              ? ['*', 'auto', 'auto', 'auto', 'auto', 'auto']
              : ['*', 'auto', 'auto', 'auto'],
            body: itemsTable,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f5f5f5' : null,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
          },
          fontSize: 9,
          margin: [0, 0, 0, 10],
        },

        {
          columns: [
            { text: '' },
            {
              stack: withVat
                ? [
                    {
                      text: `Cena spolu bez DPH: ${invoice.total_price.toFixed(2)} €`,
                      margin: [0, 5, 0, 0],
                    },
                    {
                      text: `DPH 23%: ${(invoice.total_price * 0.23).toFixed(2)} €`,
                    },
                    {
                      text: `Spolu na úhradu: ${(invoice.total_price * 1.23).toFixed(2)} €`,
                      bold: true,
                      fontSize: 12,
                    },
                  ]
                : [
                    {
                      text: `Spolu na úhradu: ${invoice.total_price.toFixed(2)} €`,
                      bold: true,
                      fontSize: 12,
                      margin: [0, 5, 0, 0],
                    },
                  ],
              alignment: 'right',
            },
          ],
        },
        invoice.notes
          ? {
              text: [{ text: 'Poznámka:\n', bold: true }, invoice.notes],
              margin: [0, 10, 0, 10],
              fontSize: 10,
            }
          : null,

        {
          text: '\nMatratex s.r.o. • www.matratex.sk • info@matratex.sk',
          alignment: 'center',
          fontSize: 8,
          color: '#888888',
        },
      ],
      styles: {
        tableHeaderBlue: {
          bold: true,
          color: '#0d6efd',
          fontSize: 10,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
      },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer) => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', buffer.length.toString());
      res.end(buffer);
    });
  }

  async createManualInvoice(data: {
    customer_name: string;
    customer_address: string;
    items: {
      name: string;
      quantity: number;
      total_price: number;
      dimensions?: string;
    }[];
    notes?: string;
    total_price: number;
  }): Promise<Invoice> {
    // ✅ Vygeneruj invoice_number rovnako ako pri automatických faktúrach
    const year = new Date().getFullYear();
    const lastInvoice = await this.invoiceRepo.findOne({
      where: { invoice_number: Like(`${year}%`) },
      order: { invoice_number: 'DESC' },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNum = parseInt(lastInvoice.invoice_number.slice(4), 10);
      nextNumber = lastNum + 1;
    }

    const invoiceNumber = `${year}${String(nextNumber).padStart(4, '0')}`;

    const invoice = this.invoiceRepo.create({
      invoice_number: invoiceNumber,
      customer_name: data.customer_name,
      customer_address: data.customer_address,
      total_price: data.total_price,
      notes: data.notes || '',
      issue_date: new Date(),
      due_date: new Date(),
      issued_by: 'M. Macková',
      variable_symbol: invoiceNumber.replace(/\D/g, ''),
      items: data.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        total_price: item.total_price,
        dimensions: item.dimensions || '',
      })),
    });

    return await this.invoiceRepo.save(invoice);
  }

  private computeProductionStatus(items: OrderItem[]): ProductionStatus {
    const statuses = items.map((item) => item.status);

    if (
      statuses.every((status) => status === 'invoiced' || status === 'archived')
    ) {
      return 'invoiced';
    }

    if (
      statuses.every(
        (status) => status === 'completed' || status === 'archived',
      )
    ) {
      return 'completed';
    }

    if (statuses.some((status) => status === 'in-production')) {
      return 'in-production';
    }

    return 'pending';
  }
}
