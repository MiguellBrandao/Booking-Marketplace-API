import { IsDate, IsInt, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  lisitngId: number;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsString()
  currency: string
}
