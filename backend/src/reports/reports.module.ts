import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Customer } from '../customers/customer.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Invoice, Customer]),
    EmailModule,
  ],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
