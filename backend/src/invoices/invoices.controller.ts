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
  ParseIntPipe,
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

  @Post(':id/auto')
  async createAutoInvoice(@Param('id', ParseIntPipe) id: number) {
    try {
      const invoice =
        await this.invoicesService.createInvoiceForCompletedItems(id);
      return {
        success: true,
        message: 'Faktúra bola úspešne vytvorená z dokončených položiek.',
        data: {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
        },
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Nepodarilo sa vytvoriť faktúru';
      throw new NotFoundException(errorMessage);
    }
  }

  @Post()
  async createInvoice(
    @Body()
    body:
      | {
          orderId: number;
          selectedItemIds?: number[];
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
          discount?: number;
          discount_percent?: number;
        },
  ) {
    try {
      let invoice;

      // Ak má objednávku → automatická faktúra
      if ('orderId' in body) {
        invoice = await this.invoicesService.createInvoice(body.orderId);
      } else {
        // Inak manuálna (čistá) faktúra
        invoice = await this.invoicesService.createManualInvoice(body);
      }

      return {
        success: true,
        message: 'Faktúra bola úspešne vytvorená.',
        data: {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
        },
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Nepodarilo sa vytvoriť faktúru';
      throw new NotFoundException(errorMessage);
    }
  }

  @Get('status')
  async getPaymentStatus() {
    return await this.invoicesService.getPaymentStatus();
  }

  @Get('test-email')
  async testEmail() {
    return await this.invoicesService.testEmailConnection();
  }

  @Get('stats')
  async getInvoiceStats() {
    try {
      const totalInvoices = await this.invoiceRepo.count();
      const paidInvoices = await this.invoiceRepo.count({
        where: { status: 'paid' },
      });
      const unpaidInvoices = await this.invoiceRepo.count({
        where: { status: 'unpaid' },
      });
      const overdueInvoices = await this.invoiceRepo.count({
        where: { status: 'overdue' },
      });

      return {
        success: true,
        data: {
          total: totalInvoices,
          paid: paidInvoices,
          unpaid: unpaidInvoices,
          overdue: overdueInvoices,
        },
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Nepodarilo sa načítať štatistiky';
      throw new NotFoundException(errorMessage);
    }
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.invoicesService.findAll({
      page: pageNum,
      limit: limitNum,
      search,
      status,
    });
  }

  @Get('export/excel')
  async exportToExcel(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    try {
      const buffer = await this.invoicesService.exportToExcel({ search, status });
      const filename = `faktury_${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      throw new NotFoundException('Nepodarilo sa exportovať faktúry');
    }
  }

  @Get(':id')
  async getInvoiceById(@Param('id', ParseIntPipe) id: number) {
    const invoice = await this.invoicesService.getInvoiceById(id);
    if (!invoice) {
      throw new NotFoundException('Faktúra sa nenašla.');
    }
    return invoice;
  }

  @Get(':id/pdf')
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Query('withVat') withVat?: string,
  ) {
    await this.invoicesService.generateInvoicePdf(+id, res, withVat);
  }

  @Post(':id/send-reminder')
  async sendPaymentReminder(@Param('id', ParseIntPipe) id: number) {
    return await this.invoicesService.sendPaymentReminder(+id);
  }
  @Patch(':id')
  async updateInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<Invoice>,
  ) {
    try {
      const invoice = await this.invoiceRepo.findOneBy({ id: +id });
      if (!invoice) {
        throw new NotFoundException('Faktúra sa nenašla');
      }

      // Aktualizuj položky ak sú poslané
      if (updateDto.items) {
        invoice.items = updateDto.items;
        // Prepočítaj total_price
        invoice.total_price = invoice.items.reduce((sum, item) => {
          const value =
            typeof item.total_price === 'number' ? item.total_price : 0;
          return sum + value;
        }, 0);
      }

      // Zľava
      if (typeof updateDto.discount === 'number') {
        invoice.discount = updateDto.discount;
      }
      const dp = (updateDto as Record<string, unknown>)?.['discount_percent'];
      if (typeof dp === 'number') {
        invoice.discount_percent = dp;
      }

      // Ostatné polia
      if (updateDto.notes !== undefined) invoice.notes = updateDto.notes;
      if (updateDto.due_date) invoice.due_date = updateDto.due_date;
      if (updateDto.status) invoice.status = updateDto.status;

      const updatedInvoice = await this.invoiceRepo.save(invoice);

      return {
        success: true,
        message: 'Faktúra bola úspešne aktualizovaná.',
        data: updatedInvoice,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Nepodarilo sa aktualizovať faktúru';
      throw new NotFoundException(errorMessage);
    }
  }
}
