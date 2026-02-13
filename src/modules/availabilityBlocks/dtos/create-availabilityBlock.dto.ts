import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateAvailabilityBlockDto {
    @IsInt()
    listingId: number;

    @IsDateString()
    startDate: Date;

    @IsDateString()
    endDate: Date;

    @IsString()
    @IsNotEmpty()
    reason: string;
}
