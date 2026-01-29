import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTrackingService } from './payment-tracking.service';
import { Invoice } from '../invoices/entities/invoice.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]), EmailModule],
  providers: [PaymentTrackingService],
  exports: [PaymentTrackingService],
})
export class PaymentTrackingModule {}
