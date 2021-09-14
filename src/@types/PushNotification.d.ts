interface BaseMessage {
    data?: {
        [key: string]: string;
    };
    notification?: Notification;
    android?: admin.messaging.AndroidConfig;
    webpush?: admin.messaging.WebpushConfig;
    apns?: admin.messaging.ApnsConfig;
    fcmOptions?: admin.messaging.FcmOptions;
}
interface TokenMessage extends BaseMessage {
    token: string;
}
interface TopicMessage extends BaseMessage {
    topic: string;
}
interface ConditionMessage extends BaseMessage {
    condition: string;
}
