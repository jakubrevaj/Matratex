import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Získanie všetkých zákazníkov s pagination a search
  @Get()
  async getAllCustomers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<Customer[]> {
    return await this.customersService.findAll(page, limit, search);
  }

  // Získanie zákazníka podľa ID
  @Get(':id')
  async getCustomerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Customer | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.customersService.findOne(id);
  }

  // Vytvorenie nového zákazníka
  @Post()
  async createCustomer(@Body() dto: CreateCustomerDto): Promise<Customer> {
    return await this.customersService.create(dto as Customer);
  }

  // Aktualizácia zákazníka
  @Put(':id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ): Promise<Customer | null> {
    return await this.customersService.update(id, dto);
  }

  // Vymazanie zákazníka
  @Delete(':id')
  async deleteCustomer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.customersService.remove(id);
  }
}
