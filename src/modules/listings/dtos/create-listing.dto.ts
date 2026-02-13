import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from "class-validator";
import { ListingStatus } from "../listings.entity";

export class CreateListingDto {
    @IsString()
    title: string

    @IsOptional()
    @IsString()
    description: string;

    @IsString()
    city: string;

    @IsNumber()
    pricePerNight: number;

    @IsString()
    currency: string;

    @IsEnum(ListingStatus)
    status: string;
}
