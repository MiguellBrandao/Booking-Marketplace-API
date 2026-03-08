import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetBookingsDto {
  @ApiPropertyOptional({
    example: 'john',
    description:
      'Search by booking id, status, guest name/email, listing title, or listing city',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
