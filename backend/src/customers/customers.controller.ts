import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Získanie všetkých zákazníkov
  @Get()
  async getAllCustomers(): Promise<Customer[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.customersService.findAll();
  }

  // Získanie zákazníka podľa ID
  @Get(':id')
  async getCustomerById(@Param('id') id: number): Promise<Customer | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.customersService.findOne(id);
  }

  // Vytvorenie nového zákazníka
  @Post()
  async createCustomer(@Body() customer: Customer): Promise<Customer> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.customersService.create(customer);
  }

  // Aktualizácia zákazníka
  @Put(':id')
  async updateCustomer(
    @Param('id') id: number,
    @Body() customer: Partial<Customer>,
  ): Promise<Customer | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.customersService.update(id, customer);
  }

  // Vymazanie zákazníka
  @Delete(':id')
  async deleteCustomer(@Param('id') id: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.customersService.remove(id);
  }
}
