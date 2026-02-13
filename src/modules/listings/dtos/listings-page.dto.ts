import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ListingDto } from './listing.dto';

export class ListingsPageDto {
  @ApiProperty({ type: ListingDto, isArray: true })
  @Expose()
  @Type(() => ListingDto)
  data: ListingDto[];

  @ApiProperty({ example: 1 })
  @Expose()
  page: number;

  @ApiProperty({ example: 10 })
  @Expose()
  limit: number;

  @ApiProperty({ example: 42 })
  @Expose()
  total: number;

  @ApiProperty({ example: 5 })
  @Expose()
  totalPages: number;
}
