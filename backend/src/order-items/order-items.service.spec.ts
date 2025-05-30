// src/order-items/order-items.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async updateStatus(id: number, status: string): Promise<OrderItem> {
    const item = await this.orderItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Položka neexistuje');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    OrderItem.status = status as OrderItem['status'];

    return this.orderItemRepo.save(item);
  }

  async splitItem(id: number, quantityToSplit: number): Promise<OrderItem[]> {
    const item = await this.orderItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Položka neexistuje');

    if (quantityToSplit >= item.quantity || quantityToSplit <= 0) {
      throw new Error('Neplatné mnos¾ktvo na rozdelenie');
    }

    item.quantity -= quantityToSplit;
    const newItem = this.orderItemRepo.create({
      ...item,
      id: undefined,
      quantity: quantityToSplit,
    });

    await this.orderItemRepo.save(item);
    await this.orderItemRepo.save(newItem);

    return [item, newItem];
  }
}
