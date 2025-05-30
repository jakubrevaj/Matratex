import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricalOrdersService } from './historical-orders.service';
import { HistoricalOrdersController } from './historical-orders.controller';
import { HistoricalOrder } from './entities/historical-order.entity';
import { HistoricalOrderItem } from './entities/historical-order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { OrdersModule } from '../orders/orders.module'; // <== toto

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HistoricalOrder,
      HistoricalOrderItem,
      Order,
      OrderItem, // <== tento tiež potrebuješ
    ]),
    forwardRef(() => OrdersModule), // <- MUSÍ B, // <== toto je dôležité
  ],
  controllers: [HistoricalOrdersController],
  providers: [HistoricalOrdersService],
  exports: [HistoricalOrdersService, TypeOrmModule],

  //
})
export class HistoricalOrdersModule {}
