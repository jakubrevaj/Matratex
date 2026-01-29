import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeletedOrdersService } from './deleted-orders.service';
import { DeletedOrdersController } from './deleted-orders.controller';
import { DeletedOrder } from './entities/deleted-order.entity';
import { DeletedOrderItem } from './entities/deleted-order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeletedOrder,
      DeletedOrderItem,
      Order,
      OrderItem,
    ]),
  ],
  controllers: [DeletedOrdersController],
  providers: [DeletedOrdersService],
  exports: [DeletedOrdersService],
})
export class DeletedOrdersModule {}








