import { Response } from 'express';
import {
  Controller,
  Post,
  Param,
  NotFoundException,
  Res,
  Get,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,

    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>, // ✅ toto je správne
  ) {}
  @Get()
  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll() {
    return this.invoicesService.findAll(); // sem pôjdeme hneď
  }

  @Post(':id/auto')
  async createAutoInvoice(@Param('id') id: number) {
    try {
      const invoice =
        await this.invoicesService.createInvoiceForCompletedItems(id);
      return {
        message: 'Faktúra bola úspešne vytvorená z dokončených položiek.',
        id: invoice.id, // 👈 Tu posielame späť ID
      };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new NotFoundException(err.message);
    }
  }

  @Post()
  async createInvoice(
    @Body()
    body:
      | {
          orderId: number;
          selectedItemIds?: number[]; // voliteľné, ak ich nepoužívaš
          notes?: string;
        }
      | {
          customer_name: string;
          customer_address: string;
          items: {
            name: string;
            quantity: number;
            total_price: number;
            dimensions?: string;
          }[];
          total_price: number;
          notes?: string;
        },
  ) {
    // Ak má objednávku → automatická faktúra
    if ('orderId' in body) {
      return this.invoicesService.createInvoice(body.orderId);
    }

    // Inak manuálna (čistá) faktúra
    return this.invoicesService.createManualInvoice(body);
  }

  @Get(':id')
  async getInvoiceById(@Param('id') id: number) {
    const invoice = await this.invoicesService.getInvoiceById(id);
    if (!invoice) {
      throw new NotFoundException('Faktúra sa nenašla.');
    }
    return invoice;
  }

  @Get(':id/pdf')
  async generatePdf(
    @Param('id') id: number,
    @Res() res: Response,
    @Query('withVat') withVat?: string,
  ) {
    await this.invoicesService.generateInvoicePdf(+id, res, withVat);
  }
  @Patch(':id')
  async updateInvoice(
    @Param('id') id: number,
    @Body() updateDto: Partial<Invoice>,
  ) {
    const invoice = await this.invoiceRepo.findOneBy({ id: +id });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // ✅ Aktualizuj položky ak sú poslané
    if (updateDto.items) {
      invoice.items = updateDto.items;

      // ✅ Prepočítaj total_price
      invoice.total_price = invoice.items.reduce((sum, item) => {
        const value =
          typeof item.total_price === 'number' ? item.total_price : 0;
        return sum + value;
      }, 0);
    }

    // ✅ Ostatné polia (ak existujú)
    if (updateDto.notes) invoice.notes = updateDto.notes;
    if (updateDto.due_date) invoice.due_date = updateDto.due_date;

    return this.invoiceRepo.save(invoice);
  }
}
