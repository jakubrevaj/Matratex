import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])], // Importovanie entity
  controllers: [CustomersController], // Registrácia kontroléra
  providers: [CustomersService], // Registrácia servisu
  exports: [CustomersService], // Export, aby mohol byť použitý mimo tohto modulu
})
export class CustomersModule {}
