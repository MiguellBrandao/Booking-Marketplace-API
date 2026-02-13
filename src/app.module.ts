import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { AvailabilityModule } from './modules/availabilityBlocks/availabilityBlocks.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') ?? 'localhost',
          port: Number(configService.get<number>('REDIS_PORT') ?? 6379),
        },
      }),
    }),
    UsersModule,
    ListingsModule,
    AvailabilityModule,
    BookingsModule,
    PaymentsModule,
    AuthModule,
    DatabaseModule,
    JwtModule.register({}),
  ],
  controllers: [],
})
export class AppModule {}
