import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BookingsExpireService } from './bookings-expire.service';

@Processor('bookings')
export class BookingsProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingsProcessor.name);

  constructor(private readonly bookingsExpireService: BookingsExpireService) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case 'expire-pending-sweep':
        return this.bookingsExpireService.expireDuePendingBookings();
      case 'expire-booking':
        this.logger.debug('expire-booking job received but not implemented yet');
        return;
      default:
        this.logger.warn(`Unknown bookings job received: ${job.name}`);
        return;
    }
  }
}
