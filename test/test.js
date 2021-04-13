require('dotenv').config()
const assert = require('assert')
const { SQSQueue } = require('../lib')
const TestQueueURL = process.env.SQS_TEST_QUEUE_URL

describe('Test SQS Message', function () {
  it('Flush Messages', function (done) {
    const queue = new SQSQueue(TestQueueURL, {
      DeleteMessageOnReceive: true
    })

    queue.flushMessages().then(responseData => {
      assert.strictEqual(responseData, true, 'Operation Failed, function should return True')
      done()
    }).catch(error => {
      if (error.code === 'AWS.SimpleQueueService.PurgeQueueInProgress') {
        return done()
      }
      done(error)
    })
  })

  it('Send and Receive Message', function (done) {
    const queueMessageText = 'Sample Test Message'
    const queue = new SQSQueue(TestQueueURL, {
      DeleteMessageOnReceive: true
    })
    queue.sendSQSMessage(queueMessageText, {}).then(data => {
      assert.strictEqual(data.length > 0, true, `MessageID Length : ${data.length} > 0 is Failed`)

      queue.register((message) => {
        assert.strictEqual(message.data(), queueMessageText, 'Message Received is not Equal to Sent Message')
        queue.disable()
        done()
      })
      queue.startPoll()
    }).catch(error => {
      done(error)
    })
  })
})
