import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemsService.create(createOrderItemDto);
  }

  @Get()
  findAll() {
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.orderItemsService.findActiveOrHistoricalItem(+id);
    if (!item) throw new NotFoundException('Položka sa nenašla');
    return item;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return this.orderItemsService.update(+id, updateOrderItemDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderItemsService.updateStatus(+id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderItemsService.remove(+id);
  }

  @Put(':id/status')
  updateItemStatus(@Param('id') id: number, @Body() body: { status: string }) {
    return this.orderItemsService.updateStatus(id, body.status);
  }

  @Post(':id/split')
  splitItem(@Param('id') id: number, @Body() body: { quantity: number }) {
    return this.orderItemsService.splitItem(id, body.quantity);
  }
}
