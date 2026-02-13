import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './availabilityBlocks.controller';

describe('AvailabilityBlockController', () => {
  let controller: AvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
