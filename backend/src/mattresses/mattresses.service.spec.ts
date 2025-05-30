import { Test, TestingModule } from '@nestjs/testing';
import { MattressesService } from './mattresses.service';

describe('MattressesService', () => {
  let service: MattressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MattressesService],
    }).compile();

    service = module.get<MattressesService>(MattressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
