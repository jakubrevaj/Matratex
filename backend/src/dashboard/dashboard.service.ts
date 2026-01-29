import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async getDashboardMetrics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Celkové počty
    const totalOrders = await this.orderRepo.count();
    const totalInvoices = await this.invoiceRepo.count();
    const totalOrderItems = await this.orderItemRepo.count();

    // Tento mesiac
    const ordersThisMonth = await this.orderRepo.count({
      where: {
        issue_date: Between(startOfMonth, now),
      },
    });

    const invoicesThisMonth = await this.invoiceRepo.count({
      where: {
        created_at: Between(startOfMonth, now),
      },
    });

    // Finančné metriky
    const totalRevenue = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total_price)', 'total')
      .getRawOne();

    const monthlyRevenue = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total_price)', 'total')
      .where('invoice.created_at >= :startOfMonth', { startOfMonth })
      .getRawOne();

    // Stavy objednávok
    const pendingOrders = await this.orderRepo.count({
      where: { production_status: 'pending' },
    });

    const inProductionOrders = await this.orderRepo.count({
      where: { production_status: 'in-production' },
    });

    const completedOrders = await this.orderRepo.count({
      where: { production_status: 'completed' },
    });

    // Stavy faktúr - dynamicky kontrolujeme due_date
    const paidInvoices = await this.invoiceRepo.count({
      where: { status: 'paid' },
    });

    // Nezaplatené faktúry, ktoré ešte NIE SÚ po splatnosti
    const unpaidInvoices = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .where('invoice.status = :status', { status: 'unpaid' })
      .andWhere('invoice.due_date >= :now', { now })
      .getCount();

    // Po splatnosti - faktúry s unpaid/overdue statusom, ktoré prešli due_date
    const overdueInvoices = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .where('invoice.status IN (:...statuses)', { statuses: ['unpaid', 'overdue'] })
      .andWhere('invoice.due_date < :now', { now })
      .getCount();

    return {
      overview: {
        totalOrders,
        totalInvoices,
        totalOrderItems,
        ordersThisMonth,
        invoicesThisMonth,
        revenueThisMonth: parseFloat(monthlyRevenue?.total || '0'),
      },
      financial: {
        totalRevenue: parseFloat(totalRevenue?.total || '0'),
        monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
      },
      orders: {
        pending: pendingOrders,
        inProduction: inProductionOrders,
        completed: completedOrders,
      },
      invoices: {
        paid: paidInvoices,
        unpaid: unpaidInvoices,
        overdue: overdueInvoices,
      },
    };
  }

  async getSalesChartData() {
    const now = new Date();
    const months: Array<{ month: string; revenue: number; orders: number }> =
      [];

    // Posledných 6 mesiacov
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const revenue = await this.invoiceRepo
        .createQueryBuilder('invoice')
        .select('SUM(invoice.total_price)', 'total')
        .where('invoice.created_at >= :start', { start: date })
        .andWhere('invoice.created_at < :end', { end: nextMonth })
        .getRawOne();

      const orders = await this.orderRepo.count({
        where: {
          issue_date: Between(date, nextMonth),
        },
      });

      months.push({
        month: date.toLocaleDateString('sk-SK', {
          month: 'short',
          year: 'numeric',
        }),
        revenue: parseFloat(revenue?.total || '0'),
        orders,
      });
    }

    return months;
  }

  async getRecentActivity() {
    const now = new Date();
    
    // Posledné objednávky
    const recentOrders = await this.orderRepo.find({
      take: 5,
      order: { issue_date: 'DESC' },
      relations: ['customer'],
    });

    // Posledné faktúry
    const recentInvoices = await this.invoiceRepo.find({
      take: 5,
      order: { created_at: 'DESC' },
    });

    // Posledné dokončené položky
    const recentCompletedItems = await this.orderItemRepo.find({
      take: 5,
      where: { status: 'completed' },
      order: { id: 'DESC' },
      relations: ['order'],
    });

    return {
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer?.podnik || 'Neznámy zákazník',
        created_at: order.issue_date,
        status: order.production_status,
        total_price: order.total_price,
      })),
      recentInvoices: recentInvoices.map((invoice) => {
        // Dynamicky určiť status na základe due_date
        let actualStatus = invoice.status;
        if (invoice.status === 'unpaid' && invoice.due_date && new Date(invoice.due_date) < now) {
          actualStatus = 'overdue';
        }
        
        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name,
          created_at: invoice.created_at,
          status: actualStatus,
          total_price: invoice.total_price,
        };
      }),
      recentCompletedItems: recentCompletedItems.map((item) => ({
        id: item.id,
        product_name: item.product_name,
        order_number: item.order?.order_number || 'N/A',
        completed_at: new Date(), // Placeholder - OrderItem nemá updated_at
        quantity: item.quantity,
      })),
    };
  }
}
