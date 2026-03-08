import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class BookingGuestDto {
  @ApiProperty({ example: 5 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'guest@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'Guest Name' })
  @Expose()
  name: string;
}

export class BookingDto {
  @ApiProperty({ example: 22 })
  @Expose()
  id: number;

  @ApiPropertyOptional({ type: BookingGuestDto })
  @Expose()
  @Type(() => BookingGuestDto)
  guest?: BookingGuestDto;

  @ApiProperty({ example: '2026-08-10T00:00:00.000Z' })
  @Expose()
  startDate: Date;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  @Expose()
  endDate: Date;

  @ApiProperty({ example: 'pending' })
  @Expose()
  status: string;

  @ApiProperty({ example: 200 })
  @Expose()
  totalAmount: number;

  @ApiProperty({ example: 'EUR' })
  @Expose()
  currency: string;

  @ApiProperty({ example: '2026-02-20T14:15:00.000Z' })
  @Expose()
  expiresAt: Date;

  @ApiPropertyOptional({ example: '2026-02-20T14:20:00.000Z' })
  @Expose()
  canceledAt?: Date;

  @ApiPropertyOptional({ example: 'Change of plans' })
  @Expose()
  cancelReason?: string;

  @ApiPropertyOptional({ example: '2026-02-20T14:30:00.000Z' })
  @Expose()
  expiredAt?: Date;
}
