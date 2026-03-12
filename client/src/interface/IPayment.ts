export type PaymentStatus = 'pending' | 'escrowed' | 'released' | 'refunded' | 'failed';

export type PaymentType = 'deposit' | 'final_payment' | 'refund';

export interface IPayment {
    _id: string;
    userId: {
        _id: string;
        name: string;
        avatarURL?: string;
    };
    tripId: string;
    amount: number;
    status: PaymentStatus;
    paymentType: PaymentType;
    transactionId?: string;
    refundReason?: string;
    createdAt: string;
    updatedAt: string;
}
