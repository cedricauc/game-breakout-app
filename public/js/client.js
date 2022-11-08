const socket = io.connect()

const player = {
  host: false,
  roomId: null,
  username: '',
  socketId: '',
  paddleX: 0,
  paddleY: 0,
}

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const roomId = urlParams.get('room')

let paddleWidth = 75
let paddleHeight = 20
let done = true

let score
let lives
let level
let timer
let dataURL

const usernameSpan = document.querySelector('#username')
const gameCard = document.querySelector('#game-card')
const notificationCard = document.querySelector('#notification-card')
const startArea = document.querySelector('#start-area')
const restartArea = document.querySelector('#restart-area')
const waitingArea = document.querySelector('#waiting-area')
const notificationMsg = document.querySelector('#notification-message')
const container = document.querySelector('.content--canvas')
const liveText = document.querySelector('.live-text')
const scoreText = document.querySelector('.score-text')
const levelText = document.querySelector('.level-text')
const timerText = document.querySelector('.timer-text')
const shopCard = document.querySelector('#shop-card')

let canvas = {
  a: document.createElement('canvas'),
}

canvas.a.width = 720
canvas.a.height = 480
canvas.a.style = `
         display: block;
		 width: 100%;
		 height: 100%;
		 box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px;
		 background-color:#1b1b1b;
	`
container.appendChild(canvas.a)
let ctx = {
  a: canvas.a.getContext('2d'),
}

let paddleX = (canvas.a.width - paddleWidth) / 2
let paddleY = canvas.a.height - paddleHeight

document.addEventListener('mousemove', mouseMoveHandler, false)

$('#startGame').click(function (e) {
  e.preventDefault()
  player.username = usernameSpan.textContent
  player.paddleX = paddleX
  player.paddleY = paddleY

  if (roomId) {
    player.roomId = roomId
  } else {
    player.host = true
  }

  player.socketId = socket.id
  startArea.hidden = true

  gameCard.classList.remove('d-none')
  startArea.classList.add('d-none')
  done = false

  socket.emit('playerData', player)
})

$('#restartGame').click(function (e) {
  e.preventDefault()
  restartArea.classList.add('d-none')
  notificationCard.classList.add('d-none')

  gameCard.classList.remove('d-none')
  done = false

  socket.emit('play again', player)
})

$('#nextGame').click(function (e) {
  e.preventDefault()
  waitingArea.classList.add('d-none')
  notificationCard.classList.add('d-none')

  gameCard.classList.remove('d-none')
  done = false

  socket.emit('next level', player)
})

socket.on('join room', (roomId) => {
  player.roomId = roomId
  player.paddleX = paddleX
  player.paddleY = paddleY
})

socket.on('play', (_score, _lives, _level, _timer, _win, _dataURL) => {
  score = _score
  lives = _lives
  level = _level
  timer = _timer
  dataURL = _dataURL

  if (_win) {
    showWaitingArea()
  }

  if (!_lives) {
    showRestartArea()
  }

  if (!done) {
    requestAnimationFrame(draw)
  }
})

socket.on('play again waiting area', () => {
  restartArea.classList.remove('d-none')
})

socket.on('waiting area', () => {
  shopCard.classList.remove('d-none')
})


function mouseMoveHandler(e) {
  const relativeX = (e.clientX - canvas.a.getBoundingClientRect().left) * e.target.width  / canvas.a.clientWidth;

  if (
      relativeX > (paddleWidth / 2) &&
      relativeX < canvas.a.width - (paddleWidth / 2)
  ) {
    player.paddleX = relativeX - paddleWidth / 2
  }
}

function showRestartArea() {
  done = true

  if (player.host) {
    gameCard.classList.add('d-none')
    notificationCard.classList.remove('d-none')
    //restartArea.classList.remove('d-none')
    setNotificationMessage(
        'alert-success',
        'alert-danger',
        'Tu as perdu la partie ' + player.username + ' !',
    )

    socket.emit('play again waiting area', player)
  }
}

function showWaitingArea() {
  done = true

  if (player.host) {
    gameCard.classList.add('d-none')
    notificationCard.classList.remove('d-none')
    waitingArea.classList.remove('d-none')
    setNotificationMessage(
        'alert-danger',
        'alert-success',
        'Félicitations, tu as gagné la partie ' + player.username + ' !',
    )
  }
}

function setNotificationMessage(classToRemove, classToAdd, html) {
  notificationMsg.classList.remove(classToRemove)
  notificationMsg.classList.add(classToAdd)
  notificationMsg.innerHTML = html
}

function draw() {
  const image = new Image()
  image.src = dataURL
  image.onload = () => {
    ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height)
    ctx.a.drawImage(image, 0, 0)
  }
  image.onerror = err => { throw err }

  scoreText.innerHTML= score
  liveText.innerHTML= lives
  levelText.innerHTML= level
  timerText.innerHTML= Math.round(parseFloat(timer)).toString()

  socket.emit('collision detection', player)
}
