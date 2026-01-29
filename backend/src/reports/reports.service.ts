import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Customer } from '../customers/customer.entity';
import { EmailService } from '../email/email.service';
import * as ExcelJS from 'exceljs';

interface MonthlyStats {
  year: number;
  month: number;
  monthName: string;

  // Tržby
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  unpaidAmount: number;
  overdueCount: number;
  overdueAmount: number;

  // Objednávky
  totalOrders: number;
  avgOrderValue: number;
  newCustomers: number;
  returningCustomers: number;

  // Výroba
  producedItems: number;
  completedOrders: number;
  avgProductionTime: number;

  // TOP zákazníci
  topCustomers: Array<{ name: string; revenue: number; orders: number }>;

  // TOP produkty
  topProducts: Array<{ name: string; count: number; revenue: number }>;

  // Porovnanie
  previousMonthRevenue: number;
  previousYearRevenue: number;
  revenueChangePercent: number;
  yearRevenueChangePercent: number;

  // Upozornenia
  overdueInvoices: Array<{
    invoice_number: string;
    customer: string;
    amount: number;
    daysOverdue: number;
  }>;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly emailService: EmailService,
  ) {}

  async calculateMonthlyStats(date: Date): Promise<MonthlyStats> {
    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    // Predošlý mesiac
    const prevMonth = new Date(year, month - 1, 1);
    const prevMonthEnd = new Date(year, month, 0, 23, 59, 59);

    // Predošlý rok
    const prevYear = new Date(year - 1, month, 1);
    const prevYearEnd = new Date(year - 1, month + 1, 0, 23, 59, 59);

    // Získaj dáta
    const orders = await this.orderRepo.find({
      where: { issue_date: Between(startDate, endDate) },
      relations: ['customer', 'order_items'],
    });

    const invoices = await this.invoiceRepo.find({
      where: { issue_date: Between(startDate, endDate) },
    });

    const items = await this.itemRepo.find({
      where: { order: { issue_date: Between(startDate, endDate) } },
      relations: ['order'],
    });

    // Vypočítaj štatistiky
    const totalRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.total_price), 0);

    const paidInvoices = invoices.filter((inv) => inv.status === 'paid').length;
    const unpaidInvoices = invoices.filter(
      (inv) => inv.status === 'unpaid',
    ).length;
    const unpaidAmount = invoices
      .filter((inv) => inv.status === 'unpaid')
      .reduce((sum, inv) => sum + Number(inv.total_price), 0);

    // Overdue faktúry
    const today = new Date();
    const overdueInvoices = invoices
      .filter((inv) => {
        if (!inv.due_date || inv.status === 'paid') return false;
        const dueDate = new Date(inv.due_date);
        return dueDate < today;
      })
      .map((inv) => {
        const dueDate = new Date(inv.due_date);
        const daysOverdue = Math.floor(
          (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          invoice_number: inv.invoice_number,
          customer: inv.customer_name,
          amount: Number(inv.total_price),
          daysOverdue,
        };
      });

    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );

    // Objednávky
    const totalOrders = orders.length;
    const avgOrderValue =
      totalOrders > 0
        ? orders.reduce((sum, o) => sum + Number(o.total_price), 0) /
          totalOrders
        : 0;

    // Zákazníci
    const customerIds = new Set(
      orders.map((o) => o.customer?.id).filter(Boolean),
    );
    const newCustomers = 0; // TODO: Implementovať logiku
    const returningCustomers = customerIds.size;

    // Výroba
    const producedItems = items.filter(
      (i) => i.status === 'completed' || i.status === 'invoiced',
    ).length;
    const completedOrders = orders.filter(
      (o) =>
        o.production_status === 'completed' ||
        o.production_status === 'invoiced',
    ).length;

    // TOP zákazníci
    const customerRevenue = new Map<
      string,
      { revenue: number; orders: number }
    >();
    orders.forEach((order) => {
      const customerName = order.customer?.podnik || 'Neznámy';
      const current = customerRevenue.get(customerName) || {
        revenue: 0,
        orders: 0,
      };
      customerRevenue.set(customerName, {
        revenue: current.revenue + Number(order.total_price),
        orders: current.orders + 1,
      });
    });

    const topCustomers = Array.from(customerRevenue.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // TOP produkty
    const productCounts = new Map<string, { count: number; revenue: number }>();
    items.forEach((item) => {
      const current = productCounts.get(item.product_name) || {
        count: 0,
        revenue: 0,
      };
      productCounts.set(item.product_name, {
        count: current.count + item.quantity,
        revenue: current.revenue + Number(item.price) * item.quantity,
      });
    });

    const topProducts = Array.from(productCounts.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Predošlý mesiac
    const prevMonthInvoices = await this.invoiceRepo.find({
      where: { issue_date: Between(prevMonth, prevMonthEnd), status: 'paid' },
    });
    const previousMonthRevenue = prevMonthInvoices.reduce(
      (sum, inv) => sum + Number(inv.total_price),
      0,
    );

    // Predošlý rok
    const prevYearInvoices = await this.invoiceRepo.find({
      where: { issue_date: Between(prevYear, prevYearEnd), status: 'paid' },
    });
    const previousYearRevenue = prevYearInvoices.reduce(
      (sum, inv) => sum + Number(inv.total_price),
      0,
    );

    const revenueChangePercent =
      previousMonthRevenue > 0
        ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

    const yearRevenueChangePercent =
      previousYearRevenue > 0
        ? ((totalRevenue - previousYearRevenue) / previousYearRevenue) * 100
        : 0;

    const monthNames = [
      'Január',
      'Február',
      'Marec',
      'Apríl',
      'Máj',
      'Jún',
      'Júl',
      'August',
      'September',
      'Október',
      'November',
      'December',
    ];

    return {
      year,
      month: month + 1,
      monthName: monthNames[month],
      totalRevenue,
      paidInvoices,
      unpaidInvoices,
      unpaidAmount,
      overdueCount,
      overdueAmount,
      totalOrders,
      avgOrderValue,
      newCustomers,
      returningCustomers,
      producedItems,
      completedOrders,
      avgProductionTime: 0, // TODO: Implementovať
      topCustomers,
      topProducts,
      previousMonthRevenue,
      previousYearRevenue,
      revenueChangePercent,
      yearRevenueChangePercent,
      overdueInvoices,
    };
  }

  generateEmailReport(stats: MonthlyStats): string {
    const formatCurrency = (num: number) =>
      num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const formatPercent = (num: number) => {
      const sign = num >= 0 ? '▲' : '▼';
      const color = num >= 0 ? 'green' : 'red';
      return `<span style="color: ${color}">${sign} ${Math.abs(num).toFixed(1)}%</span>`;
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
    .header { background: #1976d2; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 5px 0 0 0; opacity: 0.9; }
    .stat-box { border: 2px solid #e3f2fd; padding: 20px; margin: 15px 0; border-radius: 8px; background: #fafafa; }
    .stat-box h2 { margin-top: 0; color: #1976d2; font-size: 20px; }
    .big-number { font-size: 36px; font-weight: bold; margin: 10px 0; color: #1976d2; }
    .warning-box { background: #fff3e0; border: 2px solid #ff9800; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .warning-box h2 { color: #f57c00; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #1976d2; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f5f5f5; }
    ul { padding-left: 20px; }
    ul li { margin: 8px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Mesačný Report - ${stats.monthName} ${stats.year}</h1>
    <p>Matratex s.r.o.</p>
  </div>
  
  <div class="stat-box">
    <h2>💰 TRŽBY</h2>
    <div class="big-number">${formatCurrency(stats.totalRevenue)} €</div>
    <p>${formatPercent(stats.revenueChangePercent)} vs ${stats.month === 1 ? 'December' : stats.monthName.toLowerCase()} ${stats.month === 1 ? stats.year - 1 : stats.year}</p>
    <p>${formatPercent(stats.yearRevenueChangePercent)} vs ${stats.monthName} ${stats.year - 1}</p>
  </div>
  
  <div class="stat-box">
    <h2>📋 OBJEDNÁVKY</h2>
    <ul>
      <li>Celkový počet: <strong>${stats.totalOrders} objednávok</strong></li>
      <li>Priemerná hodnota: <strong>${formatCurrency(stats.avgOrderValue)} €</strong></li>
      <li>Aktívnych zákazníkov: <strong>${stats.returningCustomers}</strong></li>
    </ul>
  </div>
  
  <div class="stat-box">
    <h2>🏭 VÝROBA</h2>
    <ul>
      <li>Vyrobených položiek: <strong>${stats.producedItems} ks</strong></li>
      <li>Dokončených objednávok: <strong>${stats.completedOrders}</strong></li>
    </ul>
  </div>
  
  <div class="stat-box">
    <h2>🧾 FAKTÚRY</h2>
    <ul>
      <li>Zaplatených: <strong>${stats.paidInvoices} faktúr</strong></li>
      <li>Nezaplatených: <strong>${stats.unpaidInvoices} (${formatCurrency(stats.unpaidAmount)} €)</strong></li>
      ${stats.overdueCount > 0 ? `<li style="color: red;"><strong>Po splatnosti: ${stats.overdueCount} (${formatCurrency(stats.overdueAmount)} €)</strong></li>` : ''}
    </ul>
  </div>
  
  ${
    stats.overdueCount > 0
      ? `
  <div class="warning-box">
    <h2>⚠️ UPOZORNENIA - Faktúry po splatnosti</h2>
    <table>
      <tr>
        <th>Faktúra</th>
        <th>Zákazník</th>
        <th>Suma</th>
        <th>Dní po splatnosti</th>
      </tr>
      ${stats.overdueInvoices
        .map(
          (inv) => `
      <tr>
        <td>${inv.invoice_number}</td>
        <td>${inv.customer}</td>
        <td>${formatCurrency(inv.amount)} €</td>
        <td style="color: red; font-weight: bold;">${inv.daysOverdue} dní</td>
      </tr>
      `,
        )
        .join('')}
    </table>
  </div>
  `
      : ''
  }
  
  <h2 style="color: #1976d2; margin-top: 30px;">🏆 TOP 5 ZÁKAZNÍKOV</h2>
  <table>
    <tr>
      <th>Zákazník</th>
      <th>Tržby</th>
      <th>Objednávky</th>
    </tr>
    ${stats.topCustomers
      .slice(0, 5)
      .map(
        (c) => `
    <tr>
      <td>${c.name}</td>
      <td>${formatCurrency(c.revenue)} €</td>
      <td>${c.orders}</td>
    </tr>
    `,
      )
      .join('')}
  </table>
  
  <h2 style="color: #1976d2; margin-top: 30px;">📦 TOP 5 PRODUKTOV</h2>
  <table>
    <tr>
      <th>Produkt</th>
      <th>Počet</th>
      <th>Tržby</th>
    </tr>
    ${stats.topProducts
      .slice(0, 5)
      .map(
        (p) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.count} ks</td>
      <td>${formatCurrency(p.revenue)} €</td>
    </tr>
    `,
      )
      .join('')}
  </table>
  
  <div class="footer">
    <p>Tento report bol automaticky vygenerovaný ${new Date().toLocaleString('sk-SK')}</p>
    <p>Systém: Matratex Production System</p>
  </div>
</body>
</html>
    `;
  }

  async generateExcel(stats: MonthlyStats): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Súhrn
    const summary = workbook.addWorksheet('Súhrn');
    summary.columns = [
      { header: 'Kategória', key: 'category', width: 30 },
      { header: 'Hodnota', key: 'value', width: 20 },
    ];

    summary.addRows([
      { category: 'Mesiac', value: `${stats.monthName} ${stats.year}` },
      { category: '', value: '' },
      { category: 'TRŽBY', value: '' },
      {
        category: 'Celkové tržby',
        value: `${stats.totalRevenue.toFixed(2)} €`,
      },
      {
        category: 'Zmena vs predošlý mesiac',
        value: `${stats.revenueChangePercent.toFixed(1)}%`,
      },
      {
        category: 'Zmena vs predošlý rok',
        value: `${stats.yearRevenueChangePercent.toFixed(1)}%`,
      },
      { category: '', value: '' },
      { category: 'OBJEDNÁVKY', value: '' },
      { category: 'Počet objednávok', value: stats.totalOrders },
      {
        category: 'Priemerná hodnota',
        value: `${stats.avgOrderValue.toFixed(2)} €`,
      },
      { category: '', value: '' },
      { category: 'FAKTÚRY', value: '' },
      { category: 'Zaplatené', value: stats.paidInvoices },
      {
        category: 'Nezaplatené',
        value: `${stats.unpaidInvoices} (${stats.unpaidAmount.toFixed(2)} €)`,
      },
      {
        category: 'Po splatnosti',
        value: `${stats.overdueCount} (${stats.overdueAmount.toFixed(2)} €)`,
      },
    ]);

    // TOP Zákazníci
    const customers = workbook.addWorksheet('TOP Zákazníci');
    customers.columns = [
      { header: 'Zákazník', key: 'name', width: 40 },
      { header: 'Tržby (€)', key: 'revenue', width: 15 },
      { header: 'Objednávky', key: 'orders', width: 15 },
    ];
    customers.addRows(stats.topCustomers);

    // TOP Produkty
    const products = workbook.addWorksheet('TOP Produkty');
    products.columns = [
      { header: 'Produkt', key: 'name', width: 40 },
      { header: 'Počet', key: 'count', width: 15 },
      { header: 'Tržby (€)', key: 'revenue', width: 15 },
    ];
    products.addRows(stats.topProducts);

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }

  async sendMonthlyReport(date: Date): Promise<void> {
    try {
      this.logger.log(
        `📊 Generujem mesačný report za ${date.toLocaleDateString('sk-SK')}...`,
      );

      const stats = await this.calculateMonthlyStats(date);
      const emailHtml = this.generateEmailReport(stats);
      const excelBuffer = await this.generateExcel(stats);

      const ownerEmail = process.env.OWNER_EMAIL || 'revaj@matratex.sk';

      await this.emailService.sendEmail({
        to: ownerEmail,
        subject: `📊 Mesačný report - ${stats.monthName} ${stats.year}`,
        html: emailHtml,
        attachments: [
          {
            filename: `report-${stats.year}-${String(stats.month).padStart(2, '0')}.xlsx`,
            content: excelBuffer,
          },
        ],
      });

      this.logger.log(`✅ Mesačný report odoslaný na ${ownerEmail}`);
    } catch (error) {
      this.logger.error('❌ Chyba pri generovaní mesačného reportu:', error);
      throw error;
    }
  }
}
