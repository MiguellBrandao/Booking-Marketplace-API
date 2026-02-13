import { Expose, Type } from 'class-transformer';

class ListingHostDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;
}

export class ListingDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => ListingHostDto)
  host: ListingHostDto;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  city: string;

  @Expose()
  pricePerNight: number;

  @Expose()
  currency: string;

  @Expose()
  status: string;
}
