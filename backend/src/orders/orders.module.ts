import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { HistoricalOrdersModule } from 'src/historical-orders/historical-orders.module';
import { HistoricalOrder } from 'src/historical-orders/entities/historical-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Customer, OrderItem, HistoricalOrder]),
    forwardRef(() => HistoricalOrdersModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
