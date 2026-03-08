import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingsService: jest.Mocked<BookingsService>;

  beforeEach(async () => {
    const bookingsServiceMock = {
      createBooking: jest.fn(),
      confirmBooking: jest.fn(),
      cancelBooking: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingsService, useValue: bookingsServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookingsController>(BookingsController);
    bookingsService = module.get(BookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates confirm booking to service', async () => {
    bookingsService.confirmBooking.mockResolvedValue({ ok: true } as never);

    await controller.confirmBooking({ id: 99 });

    expect(bookingsService.confirmBooking).toHaveBeenCalledWith(99);
  });
});
