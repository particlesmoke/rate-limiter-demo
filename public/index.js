let requestTemplate = document.getElementById("requestTemplate").content
let container = document.querySelector('#container')
const socket = io('/')

function sendRequest(){
    addRequest()
    socket.emit("sendingRequest")
}

socket.on("newRequestWasSent", function(){
    addRequest()
})

function addRequest(){
    let requestFragment = requestTemplate.cloneNode(true)
    let newAddedRequest = container.appendChild(requestFragment)
    console.log(newAddedRequest)
    setTimeout(()=>{
        container.removeChild(document.querySelectorAll('.request')[0])
    
    }, 1500)
}
