import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentDTO {
    @IsString()
    tripId!: string;

    @IsNumber()
    amount!: number;

    @IsOptional()
    @IsString()
    transactionId?: string;
}
