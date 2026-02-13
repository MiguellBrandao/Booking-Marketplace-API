import { IsDateString, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    example: 1,
    description:
      'Listing ID. Nota: campo mantido como "lisitngId" para compatibilidade atual.',
  })
  @IsInt()
  listingId: number;

  @ApiProperty({ example: '2026-02-20T14:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-02-23T11:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  currency: string
}
