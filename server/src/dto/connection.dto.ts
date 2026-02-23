export class CreateConnectionDTO {
    senderId!: string;
    receiverId!: string;
    tripId?: string;
    status?: 'pending' | 'accepted' | 'rejected';
}
