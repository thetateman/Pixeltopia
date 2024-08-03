const pixelSize = 10;
const canvas = document.getElementById("canvas0");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.lineWidth = 2;
ctx.strokeStyle = "black";
let heightOffset = (window.innerHeight - 600) / 2;
let widthOffset = (window.innerWidth - 1000) / 2;
canvas.style.top = `${heightOffset}px`
canvas.style.left = `${widthOffset}px`
for(let i = 0; i<100; i++){
    // Define a new path
    
    ctx.beginPath();

    // Set a start-point
    ctx.moveTo(i * 10, 0);

    // Set an end-point
    ctx.lineTo(i*10, 600);

    // Stroke it (Do the Drawing)
    ctx.stroke();
}
for(let i = 0; i<60; i++){
    // Define a new path
    
    ctx.beginPath();

    // Set a start-point
    ctx.moveTo(0, i*10);

    // Set an end-point
    ctx.lineTo(1000, i * 10);

    // Stroke it (Do the Drawing)
    ctx.stroke();
}
canvas.addEventListener('mousedown', (e)=>{
    window.dragging = true;
    console.log(`X: ${e.x}, Y: ${e.y}`);
    // window.
    // document.onmousemove = elementDrag;
    
      const pixelClicked = {
        x: Math.trunc((e.x  - widthOffset) / pixelSize), 
        y: Math.trunc((e.y  - heightOffset) / pixelSize),
        color: window.currentColor ?? "black"
    };
    console.log(pixelClicked);
    window.wsConnection.send(JSON.stringify(pixelClicked))
    fillPixel(pixelClicked.x, pixelClicked.y, window.currentColor ?? "black");
})

function fillPixel(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(pixelSize * x, pixelSize * y, pixelSize, pixelSize);
}

const colorPicker = document.getElementById("color-picker");
colorPicker.addEventListener("input", watchColorPicker, false);

function watchColorPicker(event) {
  window.currentColor = event.target.value;
}
function connect(){

    let wsServer = window.location.href.includes("localhost") ? `ws://localhost:8080` : "wss://pixeltopia.fun"
    const ws = new WebSocket(wsServer);
    window.wsConnection = ws;


    ws.addEventListener('error', (e)=>console.log(e));
    ws.addEventListener('close', function close(e) {
        console.log('disconnected');
        console.log(e);
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function() {
        connect();
        }, 1000);
    });

    ws.addEventListener('open', function open() {
        console.log("opened websocket connection")
    });

    ws.addEventListener('message', function message(data) {
        console.log(data.data);
        const filledPixel = JSON.parse(data.data);
        fillPixel(filledPixel.x, filledPixel.y, filledPixel.color);
    });
}
connect();

fetch("/board").then((response)=>{
    response.json().then((data)=>{
        console.log(data);
        for(let i = 0; i < 99; i++){
            for(let j = 0; j < 59; j++){
                if(data[i][j] !== ""){
                    fillPixel(i, j, data[i][j]);
                }
            }
        }
    })
})