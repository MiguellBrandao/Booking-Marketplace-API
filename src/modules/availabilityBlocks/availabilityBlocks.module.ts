import { Module } from '@nestjs/common';
import { AvailabilityController } from './availabilityBlocks.controller';
import { AvailabilityBlockService } from './availabilityBlocks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityBlocks } from './availabilityBlocks.entity';
import { ListingsModule } from '../listings/listings.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([AvailabilityBlocks]),
    ListingsModule
  ],
  controllers: [AvailabilityController],
  providers: [ AvailabilityBlockService, JwtService],
})
export class AvailabilityModule {}
