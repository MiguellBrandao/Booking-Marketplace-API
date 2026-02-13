import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookings } from './bookings.entity';
import { UsersModule } from '../users/users.module';
import { ListingsModule } from '../listings/listings.module';
import { AvailabilityModule } from '../availabilityBlocks/availabilityBlocks.module';
import { JwtService } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { BookingsJobsScheduler } from './bookings-jobs.scheduler';
import { BookingsProcessor } from './bookings.processor';
import { BookingsExpireService } from './bookings-expire.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookings]),
    BullModule.registerQueue({ name: 'bookings' }),
    UsersModule,
    ListingsModule,
    AvailabilityModule,
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsExpireService,
    BookingsJobsScheduler,
    BookingsProcessor,
    JwtService,
  ],
})
export class BookingsModule {}
