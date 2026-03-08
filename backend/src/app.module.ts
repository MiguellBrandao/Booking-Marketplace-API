import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { AvailabilityModule } from './modules/availabilityBlocks/availabilityBlocks.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';

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
    JwtModule.register({
      global: true,
    }),
    UsersModule,
    ListingsModule,
    AvailabilityModule,
    BookingsModule,
    AuthModule,
    HealthModule,
    DatabaseModule,
  ],
  controllers: [],
})
export class AppModule {}
