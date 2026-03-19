export interface IMessage {
    _id: string;
    senderId: {
        _id: string;
        name: string;
        avatarURL?: string;
    };
    content: string;
    messageType?: 'text' | 'image';
    fileUrl?: string;
    timestamp: string;
}
