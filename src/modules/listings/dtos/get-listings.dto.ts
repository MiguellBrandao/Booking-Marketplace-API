import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class GetListingsDto {
    @IsString()
    city: string

    @IsOptional()
    @IsNumber()
    minPrice: number

    @IsOptional()
    @IsNumber()
    maxPrice: number

    @IsInt()
    page: number

    @IsInt()
    limit: number
}
