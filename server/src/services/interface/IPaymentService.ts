import { IPaymentDocument } from '../../types/payment.type';
import { CreatePaymentDTO, CreateRazorpayOrderDTO, VerifyRazorpayPaymentDTO } from '../../dto/payment.dto';
import { Orders } from 'razorpay/dist/types/orders';

export interface IPaymentService {
    payDeposit(userId: string, data: CreatePaymentDTO): Promise<IPaymentDocument>;
    createOrder(userId: string, data: CreateRazorpayOrderDTO): Promise<Orders.RazorpayOrder>;
    verifyPayment(userId: string, data: VerifyRazorpayPaymentDTO): Promise<IPaymentDocument>;
    getMyPayments(userId: string, tripId: string): Promise<IPaymentDocument[]>;
    getTripPayments(tripId: string): Promise<IPaymentDocument[]>;
    getUserPayments(userId: string): Promise<IPaymentDocument[]>;
}
