import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { DeletedOrdersService } from './deleted-orders.service';
import { DeletedOrder } from './entities/deleted-order.entity';

@Controller('deleted-orders')
export class DeletedOrdersController {
  constructor(private readonly deletedOrdersService: DeletedOrdersService) {}

  @Get()
  async getAllDeletedOrders(): Promise<DeletedOrder[]> {
    return this.deletedOrdersService.getAllDeletedOrders();
  }

  @Get(':id')
  async getDeletedOrderById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeletedOrder> {
    const order = await this.deletedOrdersService.getDeletedOrderById(id);
    if (!order) {
      throw new NotFoundException('Vymazaná objednávka sa nenašla.');
    }
    return order;
  }

  @Post(':id/restore')
  async restoreOrder(@Param('id', ParseIntPipe) id: number) {
    await this.deletedOrdersService.restoreOrder(id);
    return { message: 'Objednávka bola obnovená.' };
  }

  @Delete(':id/permanent')
  async permanentlyDeleteOrder(@Param('id', ParseIntPipe) id: number) {
    await this.deletedOrdersService.permanentlyDeleteOrder(id);
    return { message: 'Objednávka bola trvalo vymazaná.' };
  }
}








