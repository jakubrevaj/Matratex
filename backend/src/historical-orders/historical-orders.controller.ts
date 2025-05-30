import { Controller, Param, Post, Res, HttpStatus, Get } from '@nestjs/common';
import { HistoricalOrdersService } from './historical-orders.service';
import { Response } from 'express';

@Controller('historical')
export class HistoricalOrdersController {
  constructor(
    private readonly historicalOrdersService: HistoricalOrdersService,
  ) {}

  // Tento endpoint ostáva ak by si ho niekedy chcel manuálne použiť
  @Post('archive/:id')
  async archiveOrder(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.historicalOrdersService.archiveCompletedOrder(Number(id));
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Objednávka bola archivovaná.' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Chyba pri archivácii objednávky.',
        error: error.message,
      });
    }
  }

  @Get()
  async getAll(@Res() res: Response) {
    try {
      const orders =
        await this.historicalOrdersService.getAllHistoricalOrders();
      return res.status(HttpStatus.OK).json(orders);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Chyba pri načítaní historických objednávok.',
        error: error.message,
      });
    }
  }
  @Get(':id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    try {
      const order = await this.historicalOrdersService.getById(Number(id));
      if (!order) {
        return res.status(404).json({ message: 'Objednávka nenájdená' });
      }
      return res.status(200).json(order);
    } catch (error) {
      return res.status(500).json({ message: 'Chyba pri načítaní', error });
    }
  }
  // Nový endpoint – archivuje všetky objednávky so statusom 'invoiced'
  @Post('archive-invoiced')
  async archiveAllInvoiced(@Res() res: Response) {
    try {
      await this.historicalOrdersService.archiveAllInvoicedOrders();
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Všetky fakturované objednávky boli archivované.' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Chyba pri hromadnej archivácii.',
        error: error.message,
      });
    }
  }
}
