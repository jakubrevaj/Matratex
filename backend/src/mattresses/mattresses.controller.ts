import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { MattressesService } from './mattresses.service';
import { Mattress } from './entities/mattress.entity';

@Controller('mattresses')
export class MattressesController {
  constructor(private readonly mattressesService: MattressesService) {}

  @Post()
  async create(@Body() data: Partial<Mattress>) {
    return this.mattressesService.create(data);
  }

  @Get()
  async findAll() {
    return this.mattressesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.mattressesService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: Partial<Mattress>) {
    return this.mattressesService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.mattressesService.remove(+id);
    return { message: 'Mattress deleted successfully' };
  }
}
