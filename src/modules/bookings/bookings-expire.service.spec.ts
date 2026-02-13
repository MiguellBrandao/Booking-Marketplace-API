import { BookingsExpireService } from './bookings-expire.service';
import { Bookings, BookingStatus } from './bookings.entity';
import { Repository } from 'typeorm';

describe('BookingsExpireService', () => {
  it('expires only due pending bookings and returns affected rows', async () => {
    const qbMock = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 4 }),
    };
    const repositoryMock = {
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
    } as unknown as jest.Mocked<Repository<Bookings>>;

    const service = new BookingsExpireService(repositoryMock);
    const affected = await service.expireDuePendingBookings();

    expect(affected).toBe(4);
    expect(repositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(qbMock.update).toHaveBeenCalledWith(Bookings);
    expect(qbMock.set).toHaveBeenCalledWith({
      status: BookingStatus.EXPIRED,
      expiredAt: expect.any(Function),
      updatedAt: expect.any(Function),
    });
    expect(qbMock.where).toHaveBeenCalledWith('status = :status', {
      status: BookingStatus.PENDING,
    });
    expect(qbMock.andWhere).toHaveBeenCalledWith('"expiresAt" < NOW()');
  });
});
