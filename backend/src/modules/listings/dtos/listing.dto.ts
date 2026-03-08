import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ListingHostDto {
  @ApiProperty({ example: 4 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'host@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'Maria Host' })
  @Expose()
  name: string;
}

export class ListingDto {
  @ApiProperty({ example: 10 })
  @Expose()
  id: number;

  @ApiProperty({ type: ListingHostDto })
  @Expose()
  @Type(() => ListingHostDto)
  host: ListingHostDto;

  @ApiProperty({ example: 'Cozy Apartment Downtown' })
  @Expose()
  title: string;

  @ApiProperty({ example: '2-bedroom apartment close to metro.' })
  @Expose()
  description: string;

  @ApiProperty({ example: 'Lisbon' })
  @Expose()
  city: string;

  @ApiProperty({ example: 120 })
  @Expose()
  pricePerNight: number;

  @ApiProperty({ example: 'EUR' })
  @Expose()
  currency: string;

  @ApiProperty({ example: 'active' })
  @Expose()
  status: string;
}
