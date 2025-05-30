import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MattressesService } from './mattresses.service';
import { MattressesController } from './mattresses.controller';
import { Mattress } from './entities/mattress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mattress])], // Tento riadok je kritický
  controllers: [MattressesController],
  providers: [MattressesService],
  exports: [MattressesService],
})
export class MattressesModule {}
