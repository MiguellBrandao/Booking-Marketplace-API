import { Expose, Type } from "class-transformer";

class ListingDto {
    @Expose()
    id

    @Expose()
    title
}

export class AvailabilityBlockDto {
    @Expose()
    @Type(() => ListingDto)
    listing: ListingDto

    @Expose()
    startDate: Date

    @Expose()
    endDate: Date

    @Expose()
    reason: string

}
