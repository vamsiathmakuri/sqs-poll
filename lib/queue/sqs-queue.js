const { SQS } = require('aws-sdk')
const { SQSMessage } = require('../queue/sqs-message')
const { AsyncSleep } = require('../helpers');

const sqs = new SQS({
    apiVersion: 'latest'
})

class SQSQueue {
    constructor(queue, options) {
        this.queueUrl = queue

        this.options = {
            DeleteMessageOnReceive: false,
            ...options
        }

        this.MessagePollOptions = {
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
            ...this.options.MessagePollOptions
        }

        this.handlers = []

        this._poll = false
    }

    async getSQSMessage() {
        const responseData = await sqs.receiveMessage({
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
            ...this.MessagePollOptions,
            QueueUrl: this.queueUrl
        }).promise()

        const receivedMessages = responseData.Messages || []
        if (this.options.DeleteMessageOnReceive && receivedMessages.length > 0) {
            await sqs.deleteMessageBatch({
                QueueUrl: this.queueUrl,
                Entries: receivedMessages.map((value) => {
                    return {
                        Id: value.MessageId,
                        ReceiptHandle: value.ReceiptHandle
                    }
                })
            }).promise()
        }

        return receivedMessages
    }

    async sendSQSMessage(messageData, options = {}, json = false) {
        if (json) {
            messageData = JSON.stringify(messageData);
        }

        const messageOptions = {
            ...options,
            MessageBody: messageData,
            QueueUrl: this.queueUrl,
        }

        const responseMessage = await sqs.sendMessage(messageOptions).promise()

        return responseMessage.MessageId
    }

    async startPoll() {
        if (this._poll) return
        this._poll = true
        while (this._poll) {
            if (this.handlers && this.handlers.length) {
                const data = await this.getSQSMessage()
                for (const message of data) {
                    const _message = new SQSMessage(this.queueUrl, message, this.options.DeleteMessageOnReceive);
                    this.handlers.forEach(handler => handler(_message))
                }
            } else {
                await AsyncSleep(1000)
            }
        }
    }

    disable() {
        this._poll = false
    }

    register(handler) {
        if(handler) {
            this.handlers.push(handler)
        }
    }
}

module.exports = { SQSQueue }