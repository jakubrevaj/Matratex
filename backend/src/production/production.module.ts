import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Order])],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
