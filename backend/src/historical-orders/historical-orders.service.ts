import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { HistoricalOrder } from './entities/historical-order.entity';
import { HistoricalOrderItem } from './entities/historical-order-item.entity';

@Injectable()
export class HistoricalOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(HistoricalOrder)
    private readonly historicalOrderRepo: Repository<HistoricalOrder>,

    @InjectRepository(HistoricalOrderItem)
    private readonly historicalItemRepo: Repository<HistoricalOrderItem>,
  ) {}

  async archiveCompletedOrder(orderId: number): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['order_items', 'customer'],
    });

    if (!order) {
      throw new Error(
        `Objednávka ${orderId} neexistuje alebo už bola archivovaná.`,
      );
    }

    const historicalOrder = this.historicalOrderRepo.create({
      order_number: order.order_number,
      customer_name: order.customer?.podnik || 'Neznámy zákazník',
      ico: order.customer?.ico,
      issue_date: order.issue_date,
      total_price: order.total_price,
      notes: order.notes,
      production_status: order.production_status,
    });

    const savedHistoricalOrder =
      await this.historicalOrderRepo.save(historicalOrder);

    const historicalItems = order.order_items.map((item) =>
      this.historicalItemRepo.create({
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        notes_core: item.notes_core,
        notes_cover: item.notes_cover,
        length: item.length,
        width: item.width,
        height: item.height,
        tech_width: item.tech_width,
        status: item.status,
        label_1: item.label_1,
        label_2: item.label_2,
        label_3: item.label_3,
        order: savedHistoricalOrder,
      }),
    );

    await this.historicalItemRepo.save(historicalItems);
    await this.orderRepo.remove(order);
  }

  async getAllHistoricalOrders(): Promise<HistoricalOrder[]> {
    return this.historicalOrderRepo.find({
      relations: ['order_items', 'customer'],
      order: { issue_date: 'DESC' },
    });
  }
  async getById(id: number): Promise<HistoricalOrder | null> {
    return await this.historicalOrderRepo.findOne({
      where: { id },
      relations: ['order_items'],
    });
  }

  async archiveAllInvoicedOrders(): Promise<void> {
    const invoicedOrders = await this.orderRepo.find({
      where: { production_status: 'invoiced' },
      relations: ['order_items', 'customer'],
    });

    for (const order of invoicedOrders) {
      await this.archiveCompletedOrder(order.id);
    }
  }
}
