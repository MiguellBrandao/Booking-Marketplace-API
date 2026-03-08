import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [BullModule.registerQueue({ name: 'bookings' })],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
