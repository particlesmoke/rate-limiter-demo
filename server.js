let express = require('express')
let app = express()
let http = require('http').createServer(app)
const { Server } = require('socket.io')
const io = new Server(http)

let slotCounter = 0
let len = 10
let requestTimeStamp = []

io.on('connection', function(socket){
    socket.on("sendingRequest", function(){
        socket.broadcast.emit("newRequestWasSent")
        requestTimeStamp[slotCounter] = Date.now()
        let freq = 10*1000/(requestTimeStamp[slotCounter]-requestTimeStamp[(slotCounter+1)%len])
        console.log(freq)
        slotCounter++
        slotCounter = slotCounter%len

    })
})
app.use(express.static('public'))

http.listen(process.env.PORT || 80);