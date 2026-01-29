import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletedOrder } from './entities/deleted-order.entity';
import { DeletedOrderItem } from './entities/deleted-order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';

@Injectable()
export class DeletedOrdersService {
  constructor(
    @InjectRepository(DeletedOrder)
    private readonly deletedOrderRepo: Repository<DeletedOrder>,
    @InjectRepository(DeletedOrderItem)
    private readonly deletedOrderItemRepo: Repository<DeletedOrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async getAllDeletedOrders(): Promise<DeletedOrder[]> {
    return this.deletedOrderRepo.find({
      relations: ['order_items'],
      order: { deleted_at: 'DESC' },
    });
  }

  async getDeletedOrderById(id: number): Promise<DeletedOrder | null> {
    return this.deletedOrderRepo.findOne({
      where: { id },
      relations: ['order_items'],
    });
  }

  async deleteOrder(orderId: number, deletedBy?: string): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'order_items'],
    });

    if (!order) {
      throw new NotFoundException('Objednávka sa nenašla.');
    }

    // Vytvor DeletedOrder
    const deletedOrder = this.deletedOrderRepo.create({
      order_number: order.order_number,
      customer_name: order.customer?.podnik || 'Neznámy zákazník',
      ico: order.customer?.ico,
      issue_date: order.issue_date,
      total_price: order.total_price,
      notes: order.notes,
      production_status: order.production_status,
      deleted_at: new Date(),
      deleted_by: deletedBy || 'Systém',
    });

    const savedDeletedOrder = await this.deletedOrderRepo.save(deletedOrder);

    // Vytvor DeletedOrderItems
    const deletedOrderItems = order.order_items.map((item) =>
      this.deletedOrderItemRepo.create({
        product_name: item.product_name,
        material_name: item.material_name,
        price: item.price,
        quantity: item.quantity,
        count: item.count,
        length: item.length,
        width: item.width,
        height: item.height,
        tech_width: item.tech_width,
        notes_core: item.notes_core,
        notes_cover: item.notes_cover,
        status: item.status,
        label_1: item.label_1,
        label_2: item.label_2,
        label_3: item.label_3,
        order: savedDeletedOrder,
      }),
    );

    await this.deletedOrderItemRepo.save(deletedOrderItems);

    // Vymaž pôvodnú objednávku
    await this.orderRepo.remove(order);
  }

  async restoreOrder(deletedOrderId: number): Promise<void> {
    const deletedOrder = await this.deletedOrderRepo.findOne({
      where: { id: deletedOrderId },
      relations: ['order_items'],
    });

    if (!deletedOrder) {
      throw new NotFoundException('Vymazaná objednávka sa nenašla.');
    }

    // Vytvor novú Order
    const restoredOrder = this.orderRepo.create({
      order_number: deletedOrder.order_number,
      issue_date: deletedOrder.issue_date,
      total_price: deletedOrder.total_price,
      notes: deletedOrder.notes,
      production_status: deletedOrder.production_status,
    });

    const savedOrder = await this.orderRepo.save(restoredOrder);

    // Vytvor nové OrderItems
    const restoredOrderItems = deletedOrder.order_items.map((item) =>
      this.orderItemRepo.create({
        product_name: item.product_name,
        material_name: item.material_name,
        price: item.price,
        quantity: item.quantity,
        count: item.count,
        length: item.length,
        width: item.width,
        height: item.height,
        tech_width: item.tech_width,
        notes_core: item.notes_core,
        notes_cover: item.notes_cover,
        status: item.status as OrderItem['status'],
        label_1: item.label_1,
        label_2: item.label_2,
        label_3: item.label_3,
        order: savedOrder,
      }),
    );

    await this.orderItemRepo.save(restoredOrderItems);

    // Vymaž z deleted_orders
    await this.deletedOrderRepo.remove(deletedOrder);
  }

  async permanentlyDeleteOrder(deletedOrderId: number): Promise<void> {
    const deletedOrder = await this.deletedOrderRepo.findOne({
      where: { id: deletedOrderId },
    });

    if (!deletedOrder) {
      throw new NotFoundException('Vymazaná objednávka sa nenašla.');
    }

    await this.deletedOrderRepo.remove(deletedOrder);
  }
}








