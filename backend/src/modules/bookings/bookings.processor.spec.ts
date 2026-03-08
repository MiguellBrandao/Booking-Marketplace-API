import { BookingsProcessor } from './bookings.processor';
import { BookingsExpireService } from './bookings-expire.service';

describe('BookingsProcessor', () => {
  let processor: BookingsProcessor;
  let expireService: jest.Mocked<BookingsExpireService>;

  beforeEach(() => {
    expireService = {
      expireDuePendingBookings: jest.fn(),
    } as unknown as jest.Mocked<BookingsExpireService>;
    processor = new BookingsProcessor(expireService);
  });

  it('handles expire-pending-sweep job', async () => {
    expireService.expireDuePendingBookings.mockResolvedValue(3);

    const result = await processor.process({ name: 'expire-pending-sweep' } as never);

    expect(result).toBe(3);
    expect(expireService.expireDuePendingBookings).toHaveBeenCalledTimes(1);
  });

  it('ignores unknown jobs', async () => {
    const result = await processor.process({ name: 'unknown-job' } as never);

    expect(result).toBeUndefined();
    expect(expireService.expireDuePendingBookings).not.toHaveBeenCalled();
  });
});
