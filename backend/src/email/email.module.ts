import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { Customer } from '../customers/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
