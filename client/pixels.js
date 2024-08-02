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
    ctx.fillStyle = window.currentColor ?? "black";
    console.log(`X: ${e.x}, Y: ${e.y}`);
    // window.
    // document.onmousemove = elementDrag;
    
  

    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pixelClicked = {
        x: Math.trunc((e.x  - widthOffset) / pixelSize), 
        y: Math.trunc((e.y  - heightOffset) / pixelSize)
    };
    console.log(pixelClicked);
    ctx.fillRect(pixelSize * pixelClicked.x, pixelSize * pixelClicked.y, pixelSize, pixelSize);
})

const colorPicker = document.getElementById("color-picker");
colorPicker.addEventListener("input", watchColorPicker, false);

function watchColorPicker(event) {
  window.currentColor = event.target.value;
}

// Make the DIV element draggable:
// dragElement(document.getElementById("mydiv"));

// function dragElement(elmnt) {
//   var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
//   if (document.getElementById(elmnt.id + "header")) {
//     // if present, the header is where you move the DIV from:
//     document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
//   } else {
//     // otherwise, move the DIV from anywhere inside the DIV:
//     elmnt.onmousedown = dragMouseDown;
//   }

//   function dragMouseDown(e) {
//     e = e || window.event;
//     e.preventDefault();
//     // get the mouse cursor position at startup:
//     pos3 = e.clientX;
//     pos4 = e.clientY;
//     document.onmouseup = closeDragElement;
//     // call a function whenever the cursor moves:
//     document.onmousemove = elementDrag;
//   }

//   function elementDrag(e) {
//     e = e || window.event;
//     e.preventDefault();
//     // calculate the new cursor position:
//     pos1 = pos3 - e.clientX;
//     pos2 = pos4 - e.clientY;
//     pos3 = e.clientX;
//     pos4 = e.clientY;
//     // set the element's new position:
//     elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
//     elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
//   }

//   function closeDragElement() {
//     // stop moving when mouse button is released:
//     document.onmouseup = null;
//     document.onmousemove = null;
//   }
// }