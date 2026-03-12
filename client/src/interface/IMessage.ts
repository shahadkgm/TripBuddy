export interface IMessage {
    _id: string;
    senderId: {
        _id: string;
        name: string;
        avatarURL?: string;
    };
    content: string;
    timestamp: string;
}
