import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { Order } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { ArchivedItemsModule } from 'src/archived-items/archived-items.module';
import { HistoricalOrderItem } from 'src/historical-orders/entities/historical-order-item.entity';
import { HistoricalOrdersModule } from 'src/historical-orders/historical-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, Order, HistoricalOrderItem]), // ✅ TU to má byť
    OrdersModule,
    ArchivedItemsModule,
    HistoricalOrdersModule, // ✅ musíš pridať tento modul (kde je HistoricalOrderItem registrovaný)
  ],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  exports: [OrderItemsService], // ak to potrebuješ inde
})
export class OrderItemsModule {}
