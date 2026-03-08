import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookings, BookingStatus } from './bookings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BookingsExpireService {
  private readonly logger = new Logger(BookingsExpireService.name);

  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
  ) {}

  async expireDuePendingBookings(): Promise<number> {
    const startedAt = Date.now();
    const result = await this.bookingsRepository
      .createQueryBuilder()
      .update(Bookings)
      .set({
        status: BookingStatus.EXPIRED,
        expiredAt: () => 'NOW()',
        updatedAt: () => 'NOW()',
      })
      .where('status = :status', { status: BookingStatus.PENDING })
      .andWhere('"expiresAt" < NOW()')
      .execute();

    const expiredCount = result.affected ?? 0;
    this.logger.log(
      JSON.stringify({
        event: 'bookings.expire.sweep',
        expiredCount,
        durationMs: Date.now() - startedAt,
      }),
    );

    return expiredCount;
  }
}
