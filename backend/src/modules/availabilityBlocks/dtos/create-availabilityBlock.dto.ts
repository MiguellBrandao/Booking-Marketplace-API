import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityBlockDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    listingId: number;

    @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
    @IsDateString()
    startDate: Date;

    @ApiProperty({ example: '2026-03-05T00:00:00.000Z' })
    @IsDateString()
    endDate: Date;

    @ApiProperty({ example: 'Maintenance work' })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
