import { Module } from '@nestjs/common';
import { AvailabilityController } from './availabilityBlocks.controller';
import { AvailabilityBlockService } from './availabilityBlocks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityBlocks } from './availabilityBlocks.entity';
import { ListingsModule } from '../listings/listings.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AvailabilityBlocks]),
    ListingsModule,
    AuthModule,
  ],
  controllers: [AvailabilityController],
  providers: [ AvailabilityBlockService],
  exports: [AvailabilityBlockService],
})
export class AvailabilityModule {}
