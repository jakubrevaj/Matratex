// src/archived-items/archived-items.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivedItem } from './entities/archived-item-entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Customer } from 'src/customers/customer.entity';

@Injectable()
export class ArchivedItemsService {
  constructor(
    @InjectRepository(ArchivedItem)
    private readonly archivedItemRepo: Repository<ArchivedItem>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async archiveItem(itemId: number): Promise<void> {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId },
      relations: ['order', 'order.customer'], // ← pridaj aj zákazníka
    });

    if (!item) {
      throw new NotFoundException('Položka sa nenašla.');
    }

    const alreadyArchived = await this.archivedItemRepo.findOneBy({
      original_item_id: item.id,
    });
    if (alreadyArchived) return;

    const archived = this.archivedItemRepo.create({
      original_item_id: item.id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      notes_core: item.notes_core,
      notes_cover: item.notes_cover,
      label_1: item.label_1,
      label_2: item.label_2,
      label_3: item.label_3,
      material_name: item.material_name,
      length: item.length,
      width: item.width,
      height: item.height,
      tech_width: item.tech_width,
      order_number: item.order?.order_number ?? null,
      customer_name: item.order?.customer?.podnik ?? null,
      ico: item.order?.customer?.ico ?? null,
    } as Partial<ArchivedItem>);

    await this.archivedItemRepo.save(archived);
  }

  async getAll(): Promise<ArchivedItem[]> {
    return this.archivedItemRepo.find({
      order: {
        archived_at: 'DESC',
      },
    });
  }
}
