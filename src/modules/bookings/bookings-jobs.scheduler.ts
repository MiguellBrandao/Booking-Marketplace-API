import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BookingsJobsScheduler implements OnModuleInit {
  constructor(@InjectQueue('bookings') private readonly bookingsQueue: Queue) {}

  async onModuleInit() {
    await this.bookingsQueue.upsertJobScheduler(
      'expire-pending-scheduler',
      { every: 30000 },
      {
        name: 'expire-pending-sweep',
        data: {},
        opts: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      },
    );
  }
}
