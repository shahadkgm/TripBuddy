import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePaymentDTO {
    @IsString()
    tripId!: string;

    @IsNumber()
    amount!: number;

    @IsOptional()
    @IsString()
    transactionId?: string;
}

export class CreateStripeSessionDTO {
    @IsNotEmpty()
    @IsNumber()
    amount!: number;

    @IsNotEmpty()
    @IsString()
    tripId!: string;
}

export class VerifyStripePaymentDTO {
    @IsNotEmpty()
    @IsString()
    sessionId!: string;

    @IsNotEmpty()
    @IsString()
    tripId!: string;
}
