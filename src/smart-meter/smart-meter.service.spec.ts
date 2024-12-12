import { Test, TestingModule } from '@nestjs/testing';
import { SmartMeterService } from './smart-meter.service';

describe('SmartMeterService', () => {
  let service: SmartMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmartMeterService],
    }).compile();

    service = module.get<SmartMeterService>(SmartMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
