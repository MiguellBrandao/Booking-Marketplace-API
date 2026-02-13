import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateAvailabilityBlockDto {
    @IsInt()
    @Min(1)
    listingId: number;

    @IsDateString()
    startDate: Date;

    @IsDateString()
    endDate: Date;

    @IsString()
    @IsNotEmpty()
    reason: string;
}
