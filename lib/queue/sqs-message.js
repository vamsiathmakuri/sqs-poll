const { SQS } = require('aws-sdk')

const sqs = new SQS({
    apiVersion: 'latest'
})

class SQSMessage {
    constructor(queueUrl, message, deleted = false) {
        this.queueUrl = queueUrl
        this.message = message
        this.deleted = deleted
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
        return sqs.deleteMessage({
            QueueUrl: this.queueUrl,
            ReceiptHandle: this.message.ReceiptHandle
        }).promise()
    }
}

module.exports = { SQSMessage }