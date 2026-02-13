import { IsISO8601, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class FindAvailabilityBlockDto {
    @IsNumberString()
    @IsNotEmpty()
    listingId: string;

    @IsOptional()
    @IsISO8601()
    startDate?: string;

    @IsOptional()
    @IsISO8601()
    endDate?: string;
}
