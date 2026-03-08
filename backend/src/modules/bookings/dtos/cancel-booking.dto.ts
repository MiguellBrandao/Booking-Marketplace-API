import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty({ example: 15 })
  @IsInt()
  id: number;

  @ApiPropertyOptional({ example: 'Change of plans' })
  @IsOptional()
  @IsString()
  reason: string;
}
