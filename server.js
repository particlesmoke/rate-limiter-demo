const express = require('express')
const app = express()
const http = require('http').createServer(app)
const { Server } = require('socket.io')
const io = new Server(http)
const {v4:uuidv4} = require('uuid')
const randomColor = require('randomcolor')

app.use(express.static('public'))


let colors = {}

let slotCounter = 0
let len = 10
let responseTimes = [0,0,0,0,0,0,0,0,0,0]
let averageResponseTime = 0

let requestCounter = 0
let servedRequestCounter = 0
let servedRequestTimeStamp = []
let requestTimeStamp = []
let permittedResponseTime = 4
let windowSeconds = 5

function checkOverloaded(responseTime){
    averageResponseTime+=responseTime/len
    averageResponseTime-=responseTimes[slotCounter]/len
    responseTimes[slotCounter] = responseTime
    slotCounter++
    slotCounter = slotCounter%len
    let percentageOverload = 100*averageResponseTime/permittedResponseTime
    let mod = 1
    if (percentageOverload < 100)
    {
        mod = 1;               
    }
    else if (percentageOverload < 120)
    {
        mod = 2;
    }
    else if (percentageOverload < 140)
    {
        mod = 3;
    }
    else if (percentageOverload < 160)
    {
        mod = 4;
    }
    else if(percentageOverload >= 160)
    {
        mod = 10;
    }
    // console.log(responseTime)
    if(requestCounter%mod==0){
        return {throttlingRatio:mod-1, isDenied:false}
    }
    else{
        return {throttlingRatio:mod-1, isDenied:true}
    }
    
}

io.on('connection', function(socket){
    colors[socket.id] = randomColor({luminosity:'light'})
    io.to(socket.id).emit('color', colors[socket.id])
    socket.on("sendingRequest", function(){
        // let servedRequestFrequency = len*1000/(Date.now()-servedRequestTimeStamp[slotCounter])
        var windowIndex = servedRequestTimeStamp.findIndex((time)=>Date.now()-time<1000*windowSeconds)
        let servedRequestFrequency
        if(windowIndex!=-1){
            servedRequestFrequency = (servedRequestTimeStamp.length - windowIndex)/windowSeconds
        }
        else{
            servedRequestTimeStamp = []
            servedRequestFrequency = 0
        }
        let responseTime = servedRequestFrequency
        let {throttlingRatio, isDenied} = checkOverloaded(responseTime)
        if(isDenied==undefined || !isDenied){
            servedRequestTimeStamp[servedRequestCounter] = Date.now()
            servedRequestCounter++
        }
        var windowIndex = requestTimeStamp.findIndex((time)=>Date.now()-time<1000*windowSeconds)
        let requestFrequency
        if(windowIndex!=-1){
            requestFrequency = (requestTimeStamp.length - windowIndex)/windowSeconds
        }
        else{
            requestTimeStamp = []
            requestFrequency = 0
        }
        
        console.log(requestFrequency)
        // for(let i = 0; i<index; i++)
        //     requestTimeStamp.shift()
        //
        // let requestFrequency = len*1000/(Date.now()-requestTimeStamp[requestCounter%len])
        requestTimeStamp[requestCounter] = Date.now()
        requestCounter++
        requestMetrics = {isDenied:isDenied, throttlingRatio:throttlingRatio, requestFrequency:requestFrequency, servedRequestFrequency:servedRequestFrequency, color:colors[socket.id]}
        // console.log(requestMetrics.isDenied)
        socket.broadcast.emit("newRequestWasSent", requestMetrics)
        io.to(socket.id).emit("requestStatus", requestMetrics)
    })
})

http.listen(process.env.PORT);