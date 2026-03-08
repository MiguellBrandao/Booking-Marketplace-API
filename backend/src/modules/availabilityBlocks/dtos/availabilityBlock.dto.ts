import { Expose, Type } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

class ListingDto {
    @ApiProperty({ example: 10 })
    @Expose()
    id: number

    @ApiProperty({ example: 'Cozy Apartment Downtown' })
    @Expose()
    title: string
}

export class AvailabilityBlockDto {
    @ApiProperty({ type: ListingDto })
    @Expose()
    @Type(() => ListingDto)
    listing: ListingDto

    @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
    @Expose()
    startDate: Date

    @ApiProperty({ example: '2026-03-05T00:00:00.000Z' })
    @Expose()
    endDate: Date

    @ApiProperty({ example: 'Maintenance work' })
    @Expose()
    reason: string

}
