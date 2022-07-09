const requestTemplate = document.getElementById("requestTemplate").content
const failedResponseTemplate = document.getElementById("failedResponse").content
const succesfulResponseTemplate = document.getElementById("succesfulResponse").content
const container = document.getElementById('visualisationContainer')
const requestFrequencySpan = document.getElementById('requestFrequencySpan');
const responseFrequencySpan = document.getElementById('responseFrequencySpan');
const throttlingRatioSpan = document.getElementById('throttlingRatioSpan');
const requestStatus = document.getElementById('responseStatus')
const socket = io('/')
let myColor

socket.on('color', (color)=>{
    myColor = color
})

socket.on("newRequestWasSent", function(responseMetadata){
    addRequest(responseMetadata['color'])
    refreshMetrics(responseMetadata)
    setTimeout(()=>{
        addResponse(responseMetadata['isDenied'])
        refreshChart(responseMetadata)

    },650)
})

socket.on("requestStatus", function(responseMetadata){
    refreshMetrics(responseMetadata)
    requestStatus.innerHTML = responseMetadata.isDenied? "Denied" : "Served"
    requestStatus.style.color = responseMetadata.isDenied? 'red' : 'green'
    setTimeout(()=>{
        addResponse(responseMetadata['isDenied'])
        refreshChart(responseMetadata)
    },650)
})

function sendRequest(){
    addRequest(myColor)
    socket.emit("sendingRequest")
}

function addRequest(color){
    let requestFragment = requestTemplate.cloneNode(true)
    let newAddedRequest = container.appendChild(requestFragment)
    requestTemplate.children[0].style.backgroundColor = color
    setTimeout(()=>{
        container.removeChild(document.querySelectorAll('.request')[0])
    }, 1500)
}
function addResponse(isDenied){
    let responseFragment = isDenied?failedResponseTemplate.cloneNode(true): succesfulResponseTemplate.cloneNode(true)
    let newAddedResponse = container.appendChild(responseFragment)
    setTimeout(()=>{
        container.removeChild(document.querySelectorAll('.response')[0])
    }, 1500)
}

function refreshMetrics(responseMetadata){
    requestFrequencySpan.innerHTML = responseMetadata.requestFrequency
    responseFrequencySpan.innerHTML = responseMetadata.servedRequestFrequency
    throttlingRatioSpan.innerHTML = responseMetadata.throttlingRatio
    console.log(responseMetadata)
}

//chart
const chartContainer = document.getElementById('chartContainer')
google.charts.load('current', {packages: ['corechart']}).then(initialiseChart)
let data, chart, initialTime, options

function initialiseChart(){
    initialTime = Date.now()
    data = new google.visualization.DataTable()
    data.addColumn('number', 'Time Elapsed');
    data.addColumn('number', 'Average response time')
    data.addColumn('number', 'Average response time without throttling')
    data.addColumn('number', 'Permitted average response time')
    options = {
        height:450,
        curveType:'function',
        series: {2:{lineDashStyle:[5,5], color : '#260e0c'}},
        vAxis:{
            viewWindow: {
                min:0,
                max: 15
            }
        },
        chartArea: {width: '70%', height: '80%'}
    }
    chart = new google.visualization.LineChart(chartContainer)
    chart.draw(data, options);
}
let count = 0
function refreshChart(responseMetadata){
    let currentTime = (Date.now()-initialTime)/1000
    data.addRow([currentTime, responseMetadata.servedRequestFrequency, responseMetadata.requestFrequency, 4])
    while(currentTime-data.getValue(0,0)>20){
        data.removeRow(0)
    }
    chart.draw(data, options)
}