const { SQS } = require('aws-sdk')
const { ReplaySubject } = require('rxjs')
const { SQSMessage } = require('../queue/sqs-message')
const { AsyncSleep } = require('../helpers');

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

        this._observable = new ReplaySubject(1, 500)

        this._poll = false

        this.sqs = new SQS({
            apiVersion: '2012-11-05'
        })
    }

    async getSQSMessage() {
        const responseData = await this.sqs.receiveMessage({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
            ...this.MessagePollOptions
        }).promise()

        const receivedMessages = responseData.Messages || []
        if (this.options.DeleteMessageOnReceive && receivedMessages.length > 0) {
            await this.sqs.deleteMessageBatch({
                QueueUrl: this.queueUrl,
                Entries: receivedMessages.map(data => data.ReceiptHandle)
            }).promise()
        }

        return receivedMessages
    }

    sendSQSMessage(messageData, options = {}, json = false) {
        if(json) {
            messageData = JSON.stringify(messageData);    
        }

        const messageOptions = {
            ...options,
            MessageBody: messageData,
            QueueUrl: this.queueUrl,
        }

        return this.sqs.sendMessage(messageOptions).promise()
    }

    async startPoll() {
        if (this._poll) return
        this._poll = true
        while (this._poll) {
            if (this._observable && this._observable.observers && this._observable.observers.length) {
                const data = await this.getSQSMessage()
                for (const message of data) {
                    const _message = new SQSMessage(this.queueUrl, message, this._PollOptions.DeleteMessageOnReceive);
                    this._observable.next(_message)
                }
            } else {
                await AsyncSleep(1000)
            }
        }
    }

    disable() {
        this._poll = false
    }

    toObservable() {
        return this._observable
    }
}

module.exports = { SQSQueue }