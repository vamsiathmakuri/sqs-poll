interface PollOptions {
    DeleteMessageOnReceive: boolean;
}

export declare class SQSQueue {
    /**
     * SQS Queue
     */
     constructor(queue: String, options: PollOptions);
}
