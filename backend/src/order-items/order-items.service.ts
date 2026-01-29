import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { Order } from '../orders/entities/order.entity';
import { ArchivedItemsService } from 'src/archived-items/archived-items.service';
import { HistoricalOrderItem } from 'src/historical-orders/entities/historical-order-item.entity';
import { computeProductionStatus } from '../orders/orders.service';

@Injectable()
export class OrderItemsService {
  async splitItem(id: number, quantity: number): Promise<void> {
    const item = await this.orderItemRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!item) throw new NotFoundException('Položka neexistuje');
    if (quantity >= item.quantity || quantity <= 0)
      throw new BadRequestException('Neplatné množstvo pre rozdelenie');

    // zníž pôvodnú položku
    item.quantity -= quantity;

    // vytvor novú položku s rovnakou jednotkovou cenou
    const newItem = this.orderItemRepo.create({
      ...item,
      id: undefined,
      quantity,
      price: item.price, // zachováme rovnakú cenu
      status: item.status,
    });

    await this.orderItemRepo.save([item, newItem]);

    // aktualizuj cenu objednávky
    if (item.order) {
      const allItems = await this.orderItemRepo.find({
        where: { order: { id: item.order.id } },
      });
      const newTotal = allItems.reduce(
        (sum, i) => sum + (i.price * i.quantity || 0),
        0,
      );
      item.order.total_price = Math.round(newTotal * 100) / 100;
      await this.orderRepo.save(item.order);
    }
  }

  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(HistoricalOrderItem) // 👈 TOTO PRIDAJ
    private readonly historicalOrderItemRepo: Repository<HistoricalOrderItem>, // 👈 TOTO PRIDAJ

    private readonly archivedItemsService: ArchivedItemsService, // ← pridaj toto
  ) {}

  async create(createOrderItemDto: Partial<OrderItem>): Promise<OrderItem> {
    const orderItem = this.orderItemRepo.create(createOrderItemDto);
    return await this.orderItemRepo.save(orderItem);
  }

  async findAll(): Promise<OrderItem[]> {
    return this.orderItemRepo.find({
      relations: ['order', 'order.customer'],
      order: { order: { order_number: 'DESC' } },
    });
  }

  async findOne(id: number): Promise<OrderItem> {
    const orderItem = await this.orderItemRepo.findOne({
      where: { id },
      relations: ['order', 'invoice'], // ← doplnené
    });

    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }

    return orderItem;
  }

  async update(
    id: number,
    updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    await this.orderItemRepo.update(id, updateOrderItemDto);
    return this.findOne(id);
  }

  async updateStatus(id: number, status: string): Promise<OrderItem> {
    const validStatuses = [
      'pending',
      'to-production',
      'in-production',
      'completed',
      'invoiced',
      'archived',
    ];

    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }

    const orderItem = await this.findOne(id);
    orderItem.status = status as OrderItem['status'];

    const updated = await this.orderItemRepo.save(orderItem);

    if (status === 'archived') {
      await this.archivedItemsService.archiveItem(id);
    }
    if (orderItem.order) {
      const allItems = await this.orderItemRepo.find({
        where: { order: { id: orderItem.order.id } },
      });
      const newStatus = computeProductionStatus(allItems);
      if (orderItem.order.production_status !== newStatus) {
        await this.orderRepo.update(orderItem.order.id, {
          production_status: newStatus,
        });
      }
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.orderItemRepo.delete(id);
  }

  async findActiveOrHistoricalItem(id: number): Promise<any> {
    const active = await this.orderItemRepo.findOne({
      where: { id },
      relations: ['order'],
    });

    if (active) return { ...active, isHistorical: false };

    const historical = await this.historicalOrderItemRepo.findOne({
      where: { id },
      relations: ['order'],
    });

    if (historical) return { ...historical, isHistorical: true };

    return null;
  }
}
