import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
@Module({
  imports: [UsersModule, ListingsModule, AvailabilityModule, BookingsModule, PaymentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
