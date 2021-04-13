import { SQSMessage } from "./sqs-message";

interface PollOptions {
    DeleteMessageOnReceive: boolean;
    MessagePollOptions: AWS.SQS.ReceiveMessageRequest;
}

export declare class SQSQueue {
    /**
     * SQS Queue
     */
    constructor(queue: String, options: PollOptions);
    
    sendSQSMessage(messageData: Object | String, options: AWS.SQS.SendMessageRequest, json: Boolean): Promise<String>;

    startPoll(): Promise<void>;
    
    disable(): void;

    register(handler: (message: SQSMessage) => any);
}
