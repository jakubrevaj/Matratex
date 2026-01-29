import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { validate } from './config/env.validation';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { MattressesModule } from './mattresses/mattresses.module';
import { MaterialsModule } from './materials/materials.module';
import { InvoicesModule } from './invoices/invoices.module';
import { HistoricalOrdersModule } from './historical-orders/historical-orders.module';
import { DeletedOrdersModule } from './deleted-orders/deleted-orders.module';
import { ArchivedItemsModule } from './archived-items/archived-items.module';
import { ProductionModule } from './production/production.module';
import { DeliveryModule } from './delivery/delivery.module';
import { EmailModule } from './email/email.module';
import { PaymentTrackingModule } from './payment-tracking/payment-tracking.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';

// Import všetkých entít
import { Customer } from './customers/customer.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './order-items/entities/order-item.entity';
import { Mattress } from './mattresses/entities/mattress.entity';
import { Material } from './materials/entities/material.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { HistoricalOrder } from './historical-orders/entities/historical-order.entity';
import { HistoricalOrderItem } from './historical-orders/entities/historical-order-item.entity';
import { DeletedOrder } from './deleted-orders/entities/deleted-order.entity';
import { DeletedOrderItem } from './deleted-orders/entities/deleted-order-item.entity';
import { ArchivedItem } from './archived-items/entities/archived-item-entity';
import { Delivery } from './delivery/delivery.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE', 'matrac_system'),
        entities: [
          Customer,
          Order,
          OrderItem,
          Mattress,
          Material,
          Invoice,
          HistoricalOrder,
          HistoricalOrderItem,
          DeletedOrder,
          DeletedOrderItem,
          ArchivedItem,
          Delivery,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: false,
      }),
      inject: [ConfigService],
    }),
    CustomersModule,
    OrdersModule,
    OrderItemsModule,
    MattressesModule,
    MaterialsModule,
    InvoicesModule,
    HistoricalOrdersModule,
    DeletedOrdersModule,
    ArchivedItemsModule,
    ProductionModule,
    DeliveryModule,
    EmailModule,
    PaymentTrackingModule,
    DashboardModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
