import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ListingStatus } from "../listings.entity";

export class UpdateListingDto {
    @IsOptional()
    @IsString()
    title: string

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    city: string;

    @IsOptional()
    @IsNumber()
    pricePerNight: number;

    @IsOptional()
    @IsString()
    currency: string;

    @IsOptional()
    @IsEnum(ListingStatus)
    status: string;
}
