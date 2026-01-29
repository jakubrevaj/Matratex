import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { HistoricalOrdersModule } from 'src/historical-orders/historical-orders.module';
import { DeletedOrdersModule } from 'src/deleted-orders/deleted-orders.module';
import { HistoricalOrder } from 'src/historical-orders/entities/historical-order.entity';
// import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Customer, OrderItem, HistoricalOrder]),
    forwardRef(() => HistoricalOrdersModule),
    forwardRef(() => DeletedOrdersModule),
    // forwardRef(() => DeliveryModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
