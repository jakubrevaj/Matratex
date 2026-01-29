import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('customers-with-items')
  async getCustomersWithItems() {
    return this.deliveryService.getCustomersWithItems();
  }

  @Get('customer/:customerId/items')
  async getCustomerItems(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.deliveryService.getCustomerItems(customerId);
  }

  @Post('create')
  async createDelivery(
    @Body()
    body: {
      customerId: number;
      itemIds: number[];
      notes?: string;
      customItems?: {
        name: string;
        quantity: number;
        dimensions?: string;
        info?: string;
      }[];
    },
  ) {
    return this.deliveryService.createDelivery(
      body.customerId,
      body.itemIds,
      body.notes,
      body.customItems,
    );
  }

  @Get('generate-pdf/:deliveryId')
  async generateDeliveryPDF(
    @Param('deliveryId', ParseIntPipe) deliveryId: number,
    @Res() res: Response,
  ) {
    const pdfBuffer =
      await this.deliveryService.generateDeliveryPDF(+deliveryId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="delivery-${deliveryId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get('list')
  async getAllDeliveries() {
    return this.deliveryService.getAllDeliveries();
  }
}
