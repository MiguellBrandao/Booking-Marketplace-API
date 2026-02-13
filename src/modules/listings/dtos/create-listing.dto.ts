import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

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

    @IsString()
    status: string;
}
