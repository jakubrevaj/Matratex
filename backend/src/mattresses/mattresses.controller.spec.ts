import { Test, TestingModule } from '@nestjs/testing';
import { MattressesController } from './mattresses.controller';
import { MattressesService } from './mattresses.service';

describe('MattressesController', () => {
  let controller: MattressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MattressesController],
      providers: [MattressesService],
    }).compile();

    controller = module.get<MattressesController>(MattressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
