let express = require('express')
let app = express()
let http = require('http').createServer(app)
const { Server } = require('socket.io')
const io = new Server(http)


io.on('connection', function(socket){
    socket.on("sendingRequest", function(){
        socket.broadcast.emit("newRequestWasSent")
        console.log("Heyy I recieved a helloo")
    })
})
app.use(express.static('public'))

http.listen(80);