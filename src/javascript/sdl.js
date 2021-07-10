const { EventsViaPoll } = require('./events/events-via-poll')

const sdl = new EventsViaPoll([ 'beforeQuit', 'quit' ])

module.exports = { sdl }
