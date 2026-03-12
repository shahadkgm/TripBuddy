import { Schema, model } from 'mongoose';
import { IPaymentDocument, PaymentStatus, PaymentType } from '../types/payment.type';

const paymentSchema = new Schema<IPaymentDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tripId: {
            type: Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },
        paymentType: {
            type: String,
            enum: Object.values(PaymentType),
            required: true,
        },
        transactionId: {
            type: String,
        },
        refundReason: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index({ userId: 1 });
paymentSchema.index({ tripId: 1 });
paymentSchema.index({ transactionId: 1 });

export const PaymentModel = model<IPaymentDocument>('Payment', paymentSchema);
