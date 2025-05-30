import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Put,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }
  @Get('lookup/:orderNumber') // ⬅️ MUSÍ BYŤ NAD TÝMTO
  async lookupOrderByNumber(@Param('orderNumber') orderNumber: string) {
    const result = await this.ordersService.findOrderAnywhere(orderNumber);
    if (!result) throw new NotFoundException('Objednávka sa nenašla');
    return result;
  }

  @Get(':id')
  async getOrderById(@Param('id') id: number): Promise<Order> {
    const order = await this.ordersService.getOrderById(id);
    if (!order) {
      throw new NotFoundException('Objednávka sa nenašla.');
    }
    return order;
  }

  @Put(':id')
  updateOrder(@Param('id') id: number, @Body() data: any) {
    return this.ordersService.updateOrder(id, data);
  }

  @Post()
  async createOrder(@Body() data: Partial<Order>): Promise<Order> {
    return this.ordersService.createOrder(data);
  }
  @Post('archive-invoiced')
  async archiveAllInvoiced() {
    await this.ordersService.archiveAllInvoicedOrders();
    return { message: 'Archivované všetky objednávky so stavom "invoiced"' };
  }

  // 🔁 NOVÝ ENDPOINT: Split and mark part of an order item as invoiced
  @Patch('order-items/:id/split')
  async splitAndInvoiceItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { quantity: number },
  ) {
    return this.ordersService.splitOrderItemAndMarkInvoiced(id, body.quantity);
  }
}
