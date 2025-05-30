// src/archived-items/archived-items.controller.ts
import { Controller, Post, Param, Get } from '@nestjs/common';
import { ArchivedItemsService } from './archived-items.service';
import { ArchivedItem } from './entities/archived-item-entity';

@Controller('archived-items')
export class ArchivedItemsController {
  constructor(private readonly archivedItemsService: ArchivedItemsService) {}

  @Post(':id')
  async archiveItem(@Param('id') id: number) {
    await this.archivedItemsService.archiveItem(+id);
    return { message: 'Položka bola úspešne archivovaná.' };
  }

  @Get()
  async getAll(): Promise<ArchivedItem[]> {
    return this.archivedItemsService.getAll();
  }
}
