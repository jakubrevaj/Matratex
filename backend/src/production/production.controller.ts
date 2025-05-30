import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('items')
  findAllPending() {
    return this.productionService.getPendingItems();
  }

  @Post('move-all-to-in-production')
  moveAllToInProduction() {
    return this.productionService.moveAllToInProduction();
  }

  @Post('scan')
  async scanBarcode(@Body('barcode') barcode: string) {
    const [orderNumber, itemId] = barcode.split('-');

    if (!orderNumber || !itemId) {
      throw new BadRequestException('Neplatný čiarový kód.');
    }

    return this.productionService.processScan(orderNumber, Number(itemId));
  }
}
