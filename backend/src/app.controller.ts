import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ReportsService } from './reports/reports.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 🧪 TESTOVACÍ ENDPOINT - Odstráň po otestovaní!
  @Get('test-monthly-report')
  async testMonthlyReport() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    await this.reportsService.sendMonthlyReport(lastMonth);
    return {
      message:
        'Report odoslaný na ' +
        (process.env.OWNER_EMAIL || 'revaj@matratex.sk'),
      month: lastMonth.toLocaleString('sk-SK', {
        month: 'long',
        year: 'numeric',
      }),
    };
  }
}
