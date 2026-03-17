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

export class CreateRazorpayOrderDTO {
    @IsNotEmpty()
    @IsNumber()
    amount!: number;

    @IsNotEmpty()
    @IsString()
    tripId!: string;
}

export class VerifyRazorpayPaymentDTO {
    @IsNotEmpty()
    @IsString()
    razorpay_order_id!: string;

    @IsNotEmpty()
    @IsString()
    razorpay_payment_id!: string;

    @IsNotEmpty()
    @IsString()
    razorpay_signature!: string;

    @IsNotEmpty()
    @IsString()
    tripId!: string;

    @IsNotEmpty()
    @IsNumber()
    amount!: number;
}
