// src/archived-items/archived-items.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivedItem } from './entities/archived-item-entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { ArchivedItemsService } from './archived-items.service';
import { ArchivedItemsController } from './archived-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArchivedItem, OrderItem, Order])],
  providers: [ArchivedItemsService],
  controllers: [ArchivedItemsController],
  exports: [ArchivedItemsService], //
})
export class ArchivedItemsModule {}
