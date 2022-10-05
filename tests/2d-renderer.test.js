const sdl = require('..')

const window = sdl.video.createWindow({ resizable: true })

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

window.on('resize', () => {
  const { width, height } = window

  window.setDrawColor(0, 255, 0)
  window.clear()

  window.setDrawColor(255, 255, 0)
  window.drawRect(width / 6, height / 6, width / 6 * 4, height / 6 * 4, true)
  window.setDrawColor(0, 0, 255)
  window.drawRect(width / 4, height / 4, width / 2, height / 2)
  window.drawLine(width / 6, height / 6, width / 6 * 5, height / 6 * 5)
  window.drawLine(width / 6, height / 6 * 5, width / 6 * 5, height / 6)

  for (let i = 0; i < 1000; i++) {
    window.setDrawColor(getRandomInt(0, 256), getRandomInt(0, 256), getRandomInt(0, 256))
    const x = getRandomInt(1, width)
    const y = getRandomInt(1, height)
    window.drawPoint(x, y)
  }
  window.present()
})
