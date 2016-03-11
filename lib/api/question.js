const cheerio = require('cheerio')
const request = require('../request')
const parser = require('../parser')
const urls = require('../config').urls

const getAttr = parser.getAttr
const getText = parser.getText

exports = module.exports = question
exports.latest = listLatest
exports.list = listQuestions

function question() {

}

function listLatest() {
    return listQuestions(null, 0)
}

function listQuestions(start, offset) {
    return request.xsrf()
        .then(_xsrf => start ? ({
            start, offset, _xsrf
        }) : ({
            offset, _xsrf
        }))
        .then(data => request(urls.questions, data))
        .then(data => {
            data = JSON.parse(data)
            return _parseQuestions(data.msg[1])
        })
        .catch(err => {
            var params = JSON.stringify({
                start, offset
            })
            throw new Error('list questions: ' + params)
        })
}

function _parseQuestions(html) {
    var $ = cheerio.load(html)
    var items = $('div.zm-item')

    var questions = []

    for (var i = 0; i < items.length; i++) {
        var item = $(items[i])
        var titleEle = $('.zm-item-title a', item)
        var authorEle = $('h2 + div > a', item)
        var timeEle = $('div.zm-item-meta time', item)

        var question = {
            logid: getAttr(item, 'id').replace('logitem-', ''),
            title: getText(titleEle),
            link: getAttr(titleEle, 'href'),
            author: {
                name: getText(authorEle),
                link: getAttr(authorEle, 'href')
            },
            time: +new Date(getText(timeEle)),
            crawltime: Date.now()
        }
        question.id = question.link.replace('/question/', '')

        questions.push(question)
    }

    return questions
}