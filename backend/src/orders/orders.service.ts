import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';

import { HistoricalOrdersService } from '../historical-orders/historical-orders.service';

import { format } from 'date-fns';
import { HistoricalOrder } from 'src/historical-orders/entities/historical-order.entity';

type Status = 'pending' | 'in-production' | 'completed' | 'invoiced';

function computeProductionStatus(items: OrderItem[]): Status {
  const statuses = items.map((item) => item.status);
  const unique = new Set(statuses);

  if (statuses.every((s) => s === 'invoiced' || s === 'archived')) {
    return 'invoiced';
  } else if (
    statuses.every(
      (s) => s === 'completed' || s === 'archived' || s === 'invoiced',
    ) &&
    statuses.some((s) => s === 'completed' || s === 'archived')
  ) {
    return 'completed';
  } else if (unique.has('in-production') || unique.has('to-production')) {
    return 'in-production';
  } else {
    return 'pending';
  }
}

@Injectable()
export class OrdersService {
  findByOrderNumber(orderNumber: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(HistoricalOrder)
    private readonly historicalOrderRepo: Repository<HistoricalOrder>,
    private readonly historicalOrdersService: HistoricalOrdersService, // 🔁 tu
  ) {}

  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['order_items', 'customer'],
    });

    if (!order) throw new NotFoundException('Objednávka neexistuje.');
    if (!data.customer?.id) throw new Error('Zákazník nie je špecifikovaný.');

    const customer = await this.customerRepo.findOne({
      where: { id: data.customer.id },
    });

    if (!customer) throw new Error('Zákazník s týmto ID neexistuje.');

    if (data.order_number !== undefined) order.order_number = data.order_number;
    if (data.issue_date !== undefined) order.issue_date = data.issue_date;
    if (data.notes !== undefined) order.notes = data.notes;
    if (data.total_price !== undefined) order.total_price = data.total_price;
    if (data.order_items) {
      // najprv vymaž všetky pôvodné položky z databázy
      await this.orderItemRepo.delete({ order: { id: order.id } });

      // vytvor nové položky a prirad ich
      order.order_items = data.order_items.map((item) =>
        this.orderItemRepo.create({ ...item, order }),
      );
    }
    order.customer = customer;

    const newStatus = computeProductionStatus(order.order_items || []);
    if (order.production_status !== newStatus) {
      order.production_status = newStatus;
    }

    const saved = await this.orderRepo.save(order);

    return saved;
  }
  async archiveAllInvoicedOrders(): Promise<void> {
    const invoicedOrders = await this.orderRepo.find({
      where: { production_status: 'invoiced' },
      relations: ['order_items', 'customer'],
    });

    for (const order of invoicedOrders) {
      await this.historicalOrdersService.archiveCompletedOrder(order.id);
    }
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepo.find({
      relations: ['customer', 'order_items'],
    });
  }

  async getOrderById(id: number): Promise<Order | null> {
    return await this.orderRepo.findOne({
      where: { id },
      relations: ['customer', 'order_items'],
    });
  }

  async createOrder(data: Partial<Order>): Promise<Order> {
    if (!data.customer?.id) throw new Error('Zákazník nie je špecifikovaný.');

    const customer = await this.customerRepo.findOne({
      where: { id: data.customer.id },
    });

    if (!customer) throw new Error('Zákazník s týmto ID neexistuje.');

    const today = format(new Date(), 'yyyyMMdd');

    const activeCount = await this.orderRepo
      .createQueryBuilder('order')
      .where(`to_char(order.issue_date, 'YYYYMMDD') = :today`, { today })
      .getCount();

    const historicalCount = await this.historicalOrderRepo
      .createQueryBuilder('historical_order')
      .where(`to_char(historical_order.issue_date, 'YYYYMMDD') = :today`, {
        today,
      })
      .getCount();

    const totalCount = activeCount + historicalCount;

    const generatedOrderNumber = `${today}${String(totalCount + 1).padStart(3, '0')}`;

    const production_status = computeProductionStatus(data.order_items || []);

    const order = this.orderRepo.create({
      order_number: generatedOrderNumber,
      ico: data.ico || undefined,
      customer,
      issue_date: data.issue_date || new Date(),
      total_price: data.total_price,
      notes: data.notes,
      order_items: data.order_items,
      production_status,
    });

    const savedOrder = await this.orderRepo.save(order);

    if (production_status === 'invoiced') {
      await this.historicalOrdersService.archiveCompletedOrder(savedOrder.id);
    }

    return savedOrder;
  }

  async splitOrderItemAndMarkInvoiced(
    itemId: number,
    quantityToInvoice: number,
  ): Promise<void> {
    const item = await this.orderItemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Položka neexistuje.');
    if (item.quantity < quantityToInvoice)
      throw new Error('Nedostatočný počet kusov.');

    item.quantity -= quantityToInvoice;

    const newItem = this.orderItemRepo.create({
      ...item,
      quantity: quantityToInvoice,
      status: 'invoiced',
    });

    await this.orderItemRepo.save([item, newItem]);
  }
  async findOrderAnywhere(
    orderNumber: string,
  ): Promise<{ id: number; isHistorical: boolean } | null> {
    const active = await this.orderRepo.findOne({
      where: { order_number: orderNumber },
    });

    if (active) {
      return { id: active.id, isHistorical: false };
    }

    const historical = await this.historicalOrderRepo.findOne({
      where: { order_number: orderNumber },
    });

    if (historical) {
      return { id: historical.id, isHistorical: true };
    }

    return null;
  }
}
