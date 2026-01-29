import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryPDFService } from './delivery-pdf.service';
import { Delivery } from './delivery.entity';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, Customer, OrderItem, Order])],
  controllers: [DeliveryController],
  providers: [DeliveryService, DeliveryPDFService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
