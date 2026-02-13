import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Queue } from 'bullmq';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectQueue('bookings') private readonly bookingsQueue: Queue,
  ) {}

  async getHealth() {
    const startedAt = Date.now();
    const dbResult = await this.dataSource.query('SELECT 1');

    const redisClient = await this.bookingsQueue.client;
    const redisPong = await redisClient.ping();

    const payload = {
      status: 'ok',
      checks: {
        db: dbResult?.[0] ? 'up' : 'down',
        redis: redisPong === 'PONG' ? 'up' : 'down',
      },
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };

    if (payload.checks.db !== 'up' || payload.checks.redis !== 'up') {
      throw new ServiceUnavailableException(payload);
    }

    return payload;
  }
}
