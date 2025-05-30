import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // ← PRIDAJ TOTO
import { CustomersModule } from './customers/customers.module';
import { MattressesModule } from './mattresses/mattresses.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { MaterialsModule } from './materials/materials.module';
import { InvoicesModule } from './invoices/invoices.module';
import { HistoricalOrdersModule } from './historical-orders/historical-orders.module';
import { AppService } from './app.service'; // ← PRIDAJ TOTO
import { ProductionModule } from './production/production.module';
import { ArchivedItemsModule } from './archived-items/archived-items.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'jakubrevaj',
      password: 'yourpassword',
      database: 'matrac_system',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScheduleModule.forRoot(), // ← PRIDAJ TOTO
    CustomersModule,
    MattressesModule,
    OrdersModule,
    OrderItemsModule,
    MaterialsModule,
    InvoicesModule,
    HistoricalOrdersModule,
    ProductionModule,
    ArchivedItemsModule,
  ],
  providers: [AppService], // ← PRIDAJ TOTO
})
export class AppModule {}
