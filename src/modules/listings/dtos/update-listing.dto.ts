import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

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
    @IsString()
    status: string;
}
