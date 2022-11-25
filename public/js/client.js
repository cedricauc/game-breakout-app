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
let buffer

const image = new Image()

const urlCreator = window.URL || window.webkitURL

const usernameSpan = document.querySelector('#username')
const gameCard = document.querySelector('#game-card')
const notificationCard = document.querySelector('#notification-card')
const shopCard = document.querySelector('#shop-card')
const startArea = document.querySelector('#start-area')
const notificationMsg = document.querySelector('#notification-message')
const container = document.querySelector('.content--canvas') ?? null
const liveText = document.querySelector('.live-text')
const scoreText = document.querySelector('.score-text')
const levelText = document.querySelector('.level-text')
const timerText = document.querySelector('.timer-text')

const freeGameSpan = document.querySelector('#free-game')
const gameNumberSpan = document.querySelector('#game-number')

const userMessageInput = document.querySelector('#user-message')
const botMessageParagraph = document.querySelector('#bot-message')
const userMessageSendParagraph = document.querySelector('#message-send')

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
if (container)
    container.appendChild(canvas.a)

let ctx = {
    a: canvas.a.getContext('2d'),
}
ctx.a.patternQuality = 'fast'
ctx.a.quality = 'fast'

let paddleX = (canvas.a.width - paddleWidth) / 2
let paddleY = canvas.a.height - paddleHeight

document.addEventListener('mousemove', mouseMoveHandler, false)
// Set up touch events for mobile, etc
canvas.a.addEventListener("touchstart", function (e) {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.a.dispatchEvent(mouseEvent);
    mouseMoveHandler(mouseEvent)
}, false);
canvas.a.addEventListener("touchend", function (e) {
    const mouseEvent = new MouseEvent("mouseup", {});
    canvas.a.dispatchEvent(mouseEvent);
    mouseMoveHandler(mouseEvent)
}, false);
canvas.a.addEventListener("touchmove", function (e) {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.a.dispatchEvent(mouseEvent);
    mouseMoveHandler(mouseEvent)
}, false);

$('#startGame').click(function (e) {
    e.preventDefault()
    player.username = usernameSpan.textContent
    player.paddleX = paddleX
    player.paddleY = paddleY

    //startArea.hidden = true
    gameCard.classList.remove('d-none')
    notificationCard.classList.add('d-none')
    startArea.classList.add('d-none')
    freeGameSpan.classList.add('d-none')

    done = false

    if (roomId) {
        player.roomId = roomId
    }

    if (player.host) {
        socket.emit('play-again', player)
    } else {
        player.host = true
        player.socketId = socket.id
        console.log('player-data')
        socket.emit('player-data', player)
    }
})

socket.on('join-room', (roomId) => {
    console.log('join-room')
    player.roomId = roomId
    player.paddleX = paddleX
    player.paddleY = paddleY
})

socket.on('play', (_score, _lives, _level, _timer, _win, _buffer) => {
    console.log('play')
    score = _score
    lives = _lives
    level = _level
    timer = _timer
    buffer = _buffer

    if (_win) {
        gameWin()
    }

    if (!_lives) {
        gameOver()
    }

    if (!done) {
        requestAnimationFrame(draw)
    }
})

socket.on('play-again-waiting-area', (gameNbr) => {

    gameNumberSpan.innerHTML = '| Jeux achetés : ' + gameNbr

    if(gameNbr > 0) {
        startArea.classList.remove('d-none')
    } else {
        shopCard.classList.remove('d-none')
    }
})

function mouseMoveHandler(e) {
    const relativeX = (e.clientX - canvas.a.getBoundingClientRect().left) * e.target.width / canvas.a.clientWidth;

    if (
        relativeX > (paddleWidth / 2) &&
        relativeX < canvas.a.width - (paddleWidth / 2)
    ) {
        player.paddleX = relativeX - paddleWidth / 2
    }
}

function gameOver() {
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

        socket.emit('game-over', player)
    }
}

function gameWin() {
    done = true

    if (player.host) {
        gameCard.classList.add('d-none')
        notificationCard.classList.remove('d-none')
        //waitingArea.classList.remove('d-none')
        setNotificationMessage(
            'alert-danger',
            'alert-success',
            'Félicitations, tu as gagné la partie ' + player.username + ' !',
        )

        socket.emit('game-win', player)
    }
}

function setNotificationMessage(classToRemove, classToAdd, html) {
    notificationMsg.classList.remove(classToRemove)
    notificationMsg.classList.add(classToAdd)
    notificationMsg.innerHTML = html
}

function draw() {
    const arrayBufferView = new Uint8Array(buffer)
    const blob = new Blob([arrayBufferView], {type: "image/png"})
    const uri = urlCreator.createObjectURL(blob)
    image.src = uri
    image.onload = () => {
        ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height)
        ctx.a.drawImage(image, 0, 0)
        urlCreator.revokeObjectURL(uri);
    }
    image.onerror = err => {
        throw err
    }
    // image.src = buffer
    // image.onload = () => {
    //     ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height)
    //     ctx.a.save()
    //     ctx.a.drawImage(image, 0, 0)
    //     ctx.a.restore()
    // }
    // image.onerror = err => { throw err }

    scoreText.innerHTML = score
    liveText.innerHTML = lives
    levelText.innerHTML = level
    timerText.innerHTML = Math.round(parseFloat(timer)).toString()

    socket.emit('collision-detection', player)
}

$('#user-send').click(function (e) {
    socket.emit('user-message', userMessageInput.value)
})

socket.on('bot-message', (response, orbit) => {
    userMessageSendParagraph.classList.add('blockquote-footer')
    userMessageSendParagraph.innerHTML = userMessageInput.value
    userMessageInput.value = ""
    botMessageParagraph.innerHTML = response

    if(orbit) {
        const dest = `a.${orbit}`
        const ref = $(dest).attr("class");
        $("#solar-system").removeClass().addClass(ref);
        $(dest).parent().find('a').removeClass('active');
        $(dest).addClass('active');
    }
})
