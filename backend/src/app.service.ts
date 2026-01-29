import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HistoricalOrdersService } from './historical-orders/historical-orders.service';
import { ReportsService } from './reports/reports.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly historicalOrdersService: HistoricalOrdersService,
    private readonly reportsService: ReportsService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  // 🔁 Spúšťa sa každý deň o 23:59
  @Cron('59 23 * * *')
  async archiveInvoicedOrdersNightly() {
    this.logger.log('🕛 Spúšťam nočnú archiváciu objednávok...');
    await this.historicalOrdersService.archiveAllInvoicedOrders();
    this.logger.log('✅ Archivácia dokončená.');
  }

  // 📊 Mesačný report - každý 1. deň v mesiaci o 2:00 ráno
  @Cron('0 2 1 * *')
  async sendMonthlyReport() {
    this.logger.log('📊 Generujem mesačný report...');

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    try {
      await this.reportsService.sendMonthlyReport(lastMonth);
      this.logger.log('✅ Mesačný report odoslaný');
    } catch (error) {
      this.logger.error('❌ Chyba pri odosielaní mesačného reportu:', error);
    }
  }
}
