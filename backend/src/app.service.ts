import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HistoricalOrdersService } from './historical-orders/historical-orders.service';

@Injectable()
export class AppService {
  constructor(
    private readonly historicalOrdersService: HistoricalOrdersService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  // 🔁 Spúšťa sa každý deň o 23:59
  @Cron('59 23 * * *')
  async archiveInvoicedOrdersNightly() {
    console.log('🕛 Spúšťam nočnú archiváciu objednávok...');
    await this.historicalOrdersService.archiveAllInvoicedOrders();
    console.log('✅ Archivácia dokončená.');
  }
}
