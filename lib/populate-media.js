var request = require('request')
  , JSONStream = require('JSONStream')
  , es = require('event-stream')
  , fs = require('fs')

var stream = JSONStream.parse('*')

// Fetch all media types
request({uri: 'https://rss.itunes.apple.com/data/lang/en-US/media-types.json', json: true}, function (err, response, types) {
  // Now massage
  request('https://rss.itunes.apple.com/data/media-types.json')
    .pipe(stream)
    .pipe(es.map(function (data, next) {
      data.display = types[data.store]
      data.feed_types = data.feed_types.map(function (type) {
        type.name = types[type.translation_key]
        return type
      })
      data.subgenres = data.subgenres.map(function (sub) {
        sub.name = types[sub.translation_key]
        delete sub.id
        return sub
      })
      next(null, data)
    }))
    .pipe(es.stringify())
    .pipe(es.join(','))
    .pipe(es.wait())
    .pipe(es.mapSync(function (data) {
      return '[' + data + ']'
    }))
    .pipe(process.stdout)
})
