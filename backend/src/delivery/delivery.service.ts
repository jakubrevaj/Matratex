import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Delivery } from './delivery.entity';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { format } from 'date-fns';
import { DeliveryPDFService } from './delivery-pdf.service';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepo: Repository<Delivery>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private pdfService: DeliveryPDFService,
  ) {}

  async generateDeliveryNumber(): Promise<string> {
    const today = format(new Date(), 'yyyyMMdd');
    const count = await this.deliveryRepo
      .createQueryBuilder('delivery')
      .where(`to_char(delivery.delivery_date, 'YYYYMMDD') = :today`, { today })
      .getCount();

    return `${today}${String(count + 1).padStart(3, '0')}`;
  }

  async createDelivery(
    customerId: number,
    itemIds: number[],
    notes?: string,
    customItems?: {
      name: string;
      quantity: number;
      dimensions?: string;
      info?: string;
    }[],
  ): Promise<Delivery> {
    const customer = await this.customerRepo.findOneBy({ id: customerId });
    if (!customer) {
      throw new Error('Customer not found');
    }

    const items = await this.orderItemRepo.findBy({ id: In(itemIds) });
    if (items.length === 0 && (!customItems || customItems.length === 0)) {
      throw new Error('No items selected');
    }

    const deliveryNumber = await this.generateDeliveryNumber();

    const delivery = this.deliveryRepo.create({
      delivery_number: deliveryNumber,
      customer,
      items,
      notes,
      custom_items: customItems || [],
    });

    return this.deliveryRepo.save(delivery);
  }

  async getDeliveriesByCustomer(customerId: number): Promise<Delivery[]> {
    // Get deliveries for a specific customer
    const deliveries = await this.deliveryRepo
      .createQueryBuilder('delivery')
      .innerJoin('delivery.customer', 'customer')
      .where('customer.id = :customerId', { customerId })
      .orderBy('delivery.delivery_date', 'DESC')
      .addSelect(['customer.id', 'customer.name', 'customer.drc'])
      .getMany();

    return deliveries;
  }

  async getAllDeliveries(): Promise<Delivery[]> {
    return this.deliveryRepo.find({
      order: { delivery_date: 'DESC' },
      relations: ['customer'],
    });
  }

  async getDeliveryById(id: number): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id },
      relations: ['customer', 'items'],
    });

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    return delivery;
  }

  async markAsPrinted(id: number): Promise<void> {
    await this.deliveryRepo.update(id, { is_printed: true });
  }

  async getCustomersWithItems(): Promise<Customer[]> {
    // Get all customers who have orders with items
    // Use a subquery approach for better performance and reliability
    const customerIds = await this.orderItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .select('DISTINCT order.customerId', 'customerId')
      .getRawMany();

    if (customerIds.length === 0) {
      return [];
    }

    const ids = customerIds.map((c) => c.customerId);

    const customers = await this.customerRepo
      .createQueryBuilder('customer')
      .where('customer.id IN (:...ids)', { ids })
      .orderBy('customer.podnik', 'ASC')
      .getMany();

    return customers;
  }

  async getCustomerItems(customerId: number): Promise<OrderItem[]> {
    // Get order items for a specific customer
    const items = await this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.order', 'order')
      .where('order.customerId = :customerId', { customerId })
      .getMany();

    return items;
  }

  async generateDeliveryPDF(deliveryId: number): Promise<Buffer> {
    const delivery = await this.getDeliveryById(deliveryId);

    try {
      // Try puppeteer first
      const pdfBuffer = await this.pdfService.generateDeliveryPDF(delivery);
      await this.markAsPrinted(deliveryId);
      return pdfBuffer;
    } catch (error) {
      console.error('Puppeteer failed, trying PDFKit:', error);
      try {
        // Fallback to PDFKit
        const pdfBuffer =
          await this.pdfService.generateDeliveryPDFWithPDFKit(delivery);
        await this.markAsPrinted(deliveryId);
        return pdfBuffer;
      } catch (pdfKitError) {
        console.error('PDFKit also failed:', pdfKitError);
        throw new Error(
          `Both PDF generation methods failed. Puppeteer: ${error instanceof Error ? error.message : String(error)}, PDFKit: ${pdfKitError instanceof Error ? pdfKitError.message : String(pdfKitError)}`,
        );
      }
    }
  }
}
