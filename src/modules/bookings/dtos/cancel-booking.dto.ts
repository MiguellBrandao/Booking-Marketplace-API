import { IsInt, IsOptional, IsString } from 'class-validator';

export class CancelBookingDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  reason: string;
}
