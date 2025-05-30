import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { HistoricalOrdersModule } from 'src/historical-orders/historical-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Order, OrderItem]),
    HistoricalOrdersModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
