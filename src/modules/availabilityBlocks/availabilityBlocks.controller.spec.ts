import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './availabilityBlocks.controller';
import { AvailabilityBlockService } from './availabilityBlocks.service';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let availabilityService: jest.Mocked<AvailabilityBlockService>;

  beforeEach(async () => {
    const availabilityServiceMock = {
      findAvailabilityBlocks: jest.fn(),
      createAvailabilityBlock: jest.fn(),
      deleteAvailabilityBlock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        { provide: AvailabilityBlockService, useValue: availabilityServiceMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AvailabilityController);
    availabilityService = module.get(AvailabilityBlockService);
  });

  it('delegates find availability blocks', async () => {
    availabilityService.findAvailabilityBlocks.mockResolvedValue([] as never);

    await controller.findAvailabilityBlocks({ listingId: '1' });

    expect(availabilityService.findAvailabilityBlocks).toHaveBeenCalledWith(
      1,
      undefined,
      undefined,
    );
  });
});
