import { BookingsJobsScheduler } from './bookings-jobs.scheduler';

describe('BookingsJobsScheduler', () => {
  it('upserts the expire pending scheduler on module init', async () => {
    const queueMock = {
      upsertJobScheduler: jest.fn().mockResolvedValue(undefined),
    };
    const scheduler = new BookingsJobsScheduler(queueMock as never);

    await scheduler.onModuleInit();

    expect(queueMock.upsertJobScheduler).toHaveBeenCalledWith(
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
  });
});
