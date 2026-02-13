import { IsISO8601, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindAvailabilityBlockDto {
    @ApiProperty({ example: '1' })
    @IsNumberString()
    @IsNotEmpty()
    listingId: string;

    @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
    @IsOptional()
    @IsISO8601()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-03-05T00:00:00.000Z' })
    @IsOptional()
    @IsISO8601()
    endDate?: string;
}
