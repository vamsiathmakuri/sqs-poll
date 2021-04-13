module.exports = {
    AsyncSleep: ms => new Promise((resolve, reject) => setTimeout(resolve, ms))
}