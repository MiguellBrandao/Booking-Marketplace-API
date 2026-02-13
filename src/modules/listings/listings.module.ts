import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listings } from './listings.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Listings])],
  controllers: [ListingsController],
  providers: [
    ListingsService,
    JwtService
  ],
  exports: [ListingsService]
})
export class ListingsModule {}
