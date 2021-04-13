const AWS = require('aws-sdk')
const { SQS } = AWS

class SQSMessage {
    constructor(queueUrl, message, deleted = false) {
        this.queueUrl = queueUrl
        this.message = message
        this.deleted = deleted

        this.sqs = new SQS({
            apiVersion: '2012-11-05'
        })
    }

    json() {
        try {
            return JSON.parse(this.data())
        } catch (error) {
            return this.data()
        }
    }

    data() {
        return this.message.Body
    }

    raw() {
        return this.message
    }

    async done() {
        if (this.deleted) return
        return this.sqs.deleteMessage({
            QueueUrl: this.queueUrl,
            ReceiptHandle: this.message.ReceiptHandle
        }).promise()
    }
}

module.exports = { SQSMessage }