import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics() {
    try {
      const metrics = await this.dashboardService.getDashboardMetrics();
      return {
        success: true,
        data: metrics,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Nepodarilo sa načítať metriky';
      throw new Error(errorMessage);
    }
  }

  @Get('sales-chart')
  async getSalesChart() {
    try {
      const chartData = await this.dashboardService.getSalesChartData();
      return {
        success: true,
        data: chartData,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Nepodarilo sa načítať graf predaja';
      throw new Error(errorMessage);
    }
  }

  @Get('recent-activity')
  async getRecentActivity() {
    try {
      const activity = await this.dashboardService.getRecentActivity();
      return {
        success: true,
        data: activity,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Nepodarilo sa načítať poslednú aktivitu';
      throw new Error(errorMessage);
    }
  }
}
