
export declare class SQSMessage {
    /**
     * AWS SQS Queue URL
     */
    queueUrl: String;

    /**
     * AWS SQS Message Object from aws-sdk receiveMessageResponse
     */
    message: AWS.SQS.Message;
    
    /**
     * AWS SQS Message Deletion Status
     */
    deleted: boolean;

    /**
     * SQS Message Implementation
     */
    constructor(queueUrl: String, message: AWS.SQS.Message, deleted: boolean);

    /**
     * Get JSON Parsed data from the message. In case of failure, raw/string message is returned.
     */
    json(): Object | String;

    /**
     * Get Raw Message value as String
     */
    data(): String;
    
    /**
     * Get AWS SQS Message Object which contains additional details of the message like MD5OfBody, Attributes, MessageAttributes etc.
     */
    raw(): AWS.SQS.Message;

    /**
     * Deletes the Message from SQS Queue. This Step is Mandatory/Required in case of Auto Delete Message is set to false.
     */
    done(): Promise<{
        $response: AWS.Response<{}, AWS.AWSError>;
    } | void>;
}
