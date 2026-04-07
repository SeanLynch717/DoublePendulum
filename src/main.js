import * as utils from "./utils.js"
import * as DoublePendulum from "./classes.js"
"use strict";
// #1 - wait for page to load
window.onload = init; 
window.onresize = resize;

// Constants
const massScale = 100;
const dAngle = .01;

let foregroundCtx; 
let tracingCtx;
let backgroundCtx;
let pendulums = [];

// References to DOM elements.
let startPauseBtn;
let resetBtn;
let addBtn;
let gravitySlider;
let dampeningSlider;
let nightTimeCheckBox;
let mass1Slider;
let mass2Slider;
let length1Slider;
let length2Slider;
let addDropDown
let safeModeCheckBox;
let hidePendulums;
let averagePotentialText;
let averageKineticText;

let showPendulums;
let isRunning;
let nightTime;
let addCount;
let safeMode;
let drag;
let dragStart;
let dragCurrent = {
    x: 0,
    y: 0
}
let centerOfCanvas;
let timer = 0;
let nameToGlow;
let realigned;

// Initialization of variables.
function init(){
    resize();

    nameToGlow = "";
    
    // get pointer to <canvas> element on page
    let foregroundCanvas = document.querySelector('#foregroundCanvas');
    let tracingCanvas = document.querySelector('#tracingCanvas');
    let backgroundCanvas = document.querySelector('#backgroundCanvas');

    foregroundCanvas.width = utils.canvasSize;
    foregroundCanvas.height = utils.canvasSize;

    tracingCanvas.width = utils.canvasSize;
    tracingCanvas.height = utils.canvasSize;

    backgroundCanvas.width = utils.canvasSize;
    backgroundCanvas.height = utils.canvasSize;
    
    // get pointer to "drawing context" and drawing API
    foregroundCtx = foregroundCanvas.getContext('2d');
    tracingCtx = tracingCanvas.getContext('2d');
    backgroundCtx = backgroundCanvas.getContext('2d');

    // Slider and chekc boxes.
    gravitySlider = document.querySelector("#gravityRange");
    dampeningSlider = document.querySelector("#dampeningRange");
    nightTimeCheckBox = document.querySelector("#nightTime");
    mass1Slider = document.querySelector("#mass1Range");
    mass2Slider = document.querySelector("#mass2Range");
    length1Slider = document.querySelector("#length1Range");
    length2Slider = document.querySelector("#length2Range");
    addDropDown = document.querySelector("#addDropDown");
    safeModeCheckBox = document.querySelector("#safeMode");
    hidePendulums = document.querySelector("#hidePendulums");
    startPauseBtn = document.querySelector('#startPauseButton');
    resetBtn = document.querySelector('#resetButton');
    addBtn = document.querySelector("#addButton");

    // Stats
    averagePotentialText = document.querySelector("#averagePotential");
    averageKineticText = document.querySelector("#averageKinetic");

    resetCanvas();

    setupEvents();

    update();
}

// Called on the reload event
// Responsible for dynamically updating the position of the canvas based on its size.
function resize() {
    let canvasWrapper = document.querySelector("#canvasWrapper");
    let contentWrapper = document.querySelector("#contentWrapper");
    if (window.innerWidth >= 1500) {
        // Initialize the size of the controls wrapper.
        contentWrapper.style.marginLeft = utils.canvasSize + 10 + 'px';
        contentWrapper.style.height = utils.canvasSize + 'px';
        contentWrapper.style.paddingTop = 0;
        canvasWrapper.style.left = 0;
        canvasWrapper.style.top = 0;
    }
    // Smaller than 1500 px width
    else{
        contentWrapper.style.marginLeft = 0;
        contentWrapper.style.height = utils.canvasSize + 'px';
        contentWrapper.style.paddingTop = utils.canvasSize +'px';
        canvasWrapper.style.left = (window.innerWidth / 2 - utils.canvasSize / 2 - 20) + 'px';
        canvasWrapper.style.top = 10 +'px';
    }

    // Adjust the screen coordinates of the center of the canvas,
    // used in the math for draggin pendulum masses.
    centerOfCanvas = {
        x: canvasWrapper.offsetLeft + utils.canvasSize / 2,
        y: canvasWrapper.offsetTop + utils.canvasSize / 2
    }
}
// Link events to appropriate action functions.
function setupEvents(){
    // Mouse down event.
    foregroundCanvas.addEventListener('mousedown', mouseDownEvent);
    // Mouse up event.
    foregroundCanvas.addEventListener('mouseup', mouseUpEvent);
    // Movemove even
    foregroundCanvas.addEventListener('mousemove', mouseMoveEvent);

    // Button onclick events.
    startPauseBtn.addEventListener("click", startPauseBtnClicked);
    startPauseBtn.innerHTML = "Start";
    resetBtn.addEventListener("click", resetCanvas);
    addBtn.addEventListener("click", addPendulum);

    // Slider events.
    gravitySlider.oninput = changeGravity;
    dampeningSlider.oninput = changeDampening;
    mass1Slider.oninput = (e) => {changeMass(e,1);} 
    mass1Slider.onmouseover = () =>{nameToGlow = 'mass1'}
    mass1Slider.onmouseleave = () =>{nameToGlow = '';}
    mass2Slider.oninput = (e) => {changeMass(e,2);} 
    mass2Slider.onmouseover = () =>{nameToGlow = 'mass2';}
    mass2Slider.onmouseleave = () =>{nameToGlow = '';}
    length1Slider.oninput = (e) => {changeLength(e,1);} 
    length1Slider.onmouseover = () =>{nameToGlow = 'length1';}
    length1Slider.onmouseleave = () =>{nameToGlow = '';}
    length2Slider.oninput = (e) => {changeLength(e,2);} 
    length2Slider.onmouseover = () =>{nameToGlow = 'length2';}
    length2Slider.onmouseleave = () =>{nameToGlow = '';}

    // Drop down
    addDropDown.oninput = (e) => { addCount = (Number)(e.target.value);}
    // Check boxes
    safeModeCheckBox.oninput = () => {
        safeMode = !safeMode;
    }
    nightTimeCheckBox.oninput = () => {
        nightTime = !nightTime;
        tracingCtx.clearRect(0, 0, utils.canvasSize, utils.canvasSize);
    }
    hidePendulums.oninput = () => {
        showPendulums = !showPendulums;
    }
}

// Clear the canvas, and reset all values.
function resetCanvas(){
    // default values;
    pendulums = [new DoublePendulum.DoublePendulum(.1, 0, .05, .05, 150, 150, Math.PI, Math.PI / 2, .5, "#2589BD", "#2589BD")];
    foregroundCtx.clearRect(0, 0, utils.canvasSize, utils.canvasSize);
    tracingCtx.clearRect(0, 0, utils.canvasSize, utils.canvasSize);
    backgroundCtx.clearRect(0, 0, utils.canvasSize, utils.canvasSize);
    isRunning = false;
    timer = 0;
    resetControlValues();
}

// Reset all of the control values.
function resetControlValues(){
    // Gravity Slider
    gravitySlider.value = pendulums[0].gravity * 50;
    document.querySelector("#gravityValue").innerHTML = pendulums[0].gravity * 50;
    // Dampening Slider
    dampeningSlider.value = pendulums[0].dampening;
    document.querySelector("#dampeningValue").innerHTML = pendulums[0].dampening;
    // Night time check box Slider
    nightTimeCheckBox.checked = false
    nightTime = false;
    // Mass1 Slider
    mass1Slider.value = pendulums[0].mass1 * massScale;
    document.querySelector("#mass1Value").innerHTML = pendulums[0].mass1 * massScale;
    // Mass2 Slider
    mass2Slider.value = pendulums[0].mass2 * massScale;
    document.querySelector("#mass2Value").innerHTML = pendulums[0].mass2 * massScale;
    // Length1 Slider
    length1Slider.value = pendulums[0].length1;
    document.querySelector("#length1Value").innerHTML = pendulums[0].length1;
    // Length2 Slider
    length2Slider.value = pendulums[0].length2;
    document.querySelector("#length2Value").innerHTML = pendulums[0].length2;
    // Start pause button
    startPauseBtn.innerHTML = "Start";
    // Add Button
    addDropDown.value = 1;
    addCount = 1;
    // Safe add
    safeMode = true;
    safeModeCheckBox.checked = true;
    // Pendulum Count
    document.querySelector("#pendulumCount").innerHTML = "&nbsp1";
    // Hide Pendulums
    hidePendulums.checked = false;
    showPendulums = true;
}

// Called on the mousedown event. 
// Determines the mass the mouse is closest two, and indicates that is the mass to move.
function mouseDownEvent(e) {
    // Get the position of the mouse
    let mousePos = {
        x: e.pageX - centerOfCanvas.x,
        y: e.pageY - centerOfCanvas.y
    };

    let closest = Infinity;
    let isMass1 = true;
    // Calculate the closest mass.
    for(let i = 0; i < pendulums.length; i++){
        let candidate = Math.sqrt(Math.pow(mousePos.x - pendulums[i].x1, 2) + Math.pow(mousePos.y - pendulums[i].y1, 2));
        if(candidate < closest){
            closest = candidate;
            isMass1 = true;
        }
        candidate = Math.sqrt(Math.pow(mousePos.x - pendulums[i].x2, 2) + Math.pow(mousePos.y - pendulums[i].y2, 2));;
        if(candidate < closest){
            closest = candidate;
            isMass1 = false;
        }
    }
    // mouse is closer to m1 than m2
    if (isMass1) {
        drag = 1;
        nameToGlow = 'mass1,length1';
        dragStart = {
            x: centerOfCanvas.x,
            y: centerOfCanvas.y,
        };
    }
    // mouse is closer to m2 than m1
    else{
        drag = 2;
        nameToGlow = 'mass2,length2';
        dragStart = {
            x: pendulums[Math.floor(pendulums.length / 2)].x1 + centerOfCanvas.x,
            y: pendulums[Math.floor(pendulums.length / 2)].y1 + centerOfCanvas.y
        };
    }

    startPauseBtn.innerHTML = "Start";
    isRunning = false;
}

// Called on the mouseup event.
// Starts the simulation if the user finished dragging a mass.
function mouseUpEvent(e){
    // cancel drag.
    drag = false;
    nameToGlow = '';
    let length1 = Math.floor(pendulums[0].length1);
    let length2 = Math.floor(pendulums[0].length2);
    document.querySelector("#length1Value").innerHTML = length1;
    document.querySelector("#length2Value").innerHTML = length2;
    length1Slider.value =  length1;
    length2Slider.value =  length2;
}

// Called on the mousemove event.
// Changes the corresponding angle of the mass being dragged.
function mouseMoveEvent(e) {
    // If a drag is initiated.
    if (drag) {
        // Current mouse position.
        dragCurrent = {
            x: e.pageX - foregroundCanvas.offsetLeft,
            y: e.pageY - foregroundCanvas.offsetTop
        };

        let a2 = -1 * Math.atan2(dragCurrent.y - dragStart.y, dragCurrent.x - dragStart.x) + Math.PI / 2;
        let length = Math.sqrt(Math.pow(dragCurrent.x - dragStart.x,2) + Math.pow(dragCurrent.y - dragStart.y, 2));
        length = Math.max(50, Math.min(length, 225));
        // Dragging the first mass.
        if(drag == 1){ 
            if(!realigned){
                for(let i = 1; i < pendulums.length; i++){
                    pendulums[i].angle2 = pendulums[0].angle2 + dAngle * i;
                }
                realigned = true;
            }
            for(let i = 0; i < pendulums.length; i++){
                pendulums[i].angle1 = a2 + dAngle * i - (dAngle * pendulums.length / 2);
            }

            for(let i = 0; i < pendulums.length; i++){
                pendulums[i].length1 = length;
            }
        }
        // Dragging the second mass.
        else{
            if(!realigned){
                for(let i = 1; i < pendulums.length; i++){
                    pendulums[i].angle1 = pendulums[0].angle1 + dAngle * i;
                }
                realigned = true;
            }
            for(let i = 0; i < pendulums.length; i++){
                pendulums[i].angle2 = a2 + dAngle * i - (dAngle * pendulums.length / 2);
            }

            for(let i = 0; i < pendulums.length; i++){
                pendulums[i].length2 = length;
            }
        }
    }
    // Mouse has moved off screen, so disable drag.
    if (dragCurrent.x < centerOfCanvas.x - utils.canvasSize / 2 || 
        dragCurrent.y < centerOfCanvas.y - utils.canvasSize / 2 || 
        dragCurrent.x > centerOfCanvas.x + utils.canvasSize / 2 || 
        dragCurrent.y > centerOfCanvas.y + utils.canvasSize / 2) {
        drag = 0;
    }
}

// Add the selected number of pendulums if it doesn't exceed the maximum allowed.
function addPendulum(){
    // Can't safely add more pendulums.
    if(safeMode && (pendulums.length + addCount) > 150) return;
    for(let i = 0; i < addCount; i++){
        let color = utils.getRandomColor();
        let index = pendulums.length + 1;
        pendulums.push(new DoublePendulum.DoublePendulum(pendulums[0].gravity, pendulums[0].dampening, pendulums[0].mass1, pendulums[0].mass2, 
            pendulums[0].length1, pendulums[0].length2, pendulums[0].angle1 + dAngle * index, pendulums[0].angle2 + dAngle * index, .5, color, color));
    }
    document.querySelector("#pendulumCount").innerHTML = "&nbsp" +(pendulums.length);
}

// Event to start and pause the simulation.
function startPauseBtnClicked(){
    // Start the simulation.
    if(startPauseBtn.innerHTML == "Start"){
        startPauseBtn.innerHTML = "Pause";
        isRunning = true;
        realigned = false;
    }
    // Reset the simulation.
    else{
        startPauseBtn.innerHTML = "Start";
        isRunning = false;
    }
}

// Event to change the gravity.
function changeGravity(e){
    for(let i = 0; i < pendulums.length; i++){
        pendulums[i].gravity = e.target.value * .02;
    }
    document.querySelector("#gravityValue").innerHTML = e.target.value;
}

// Event to change the weight.
function changeMass(e, massNumber){
    switch(massNumber){
        case 1:
            for(let i = 0; i < pendulums.length; i++){
                pendulums[i].mass1 = e.target.value / massScale;
            }
            document.querySelector("#mass1Value").innerHTML = e.target.value;
            break;
        case 2:
            for(let i = 0; i < pendulums.length; i++){
                pendulums[i].mass2 = e.target.value / massScale;
            }
            document.querySelector("#mass2Value").innerHTML = e.target.value;
            break;
    }
}

// Event to change the length.
function changeLength(e, lengthNumber){
    switch(lengthNumber){
        case 1:
            for(let i = 0; i < pendulums.length; i++){
                pendulums[i].length1 = e.target.value;
            }
            document.querySelector("#length1Value").innerHTML = pendulums[0].length1;
            break;
        case 2:
            for(let i = 0; i < pendulums.length; i++){
                pendulums[i].length2 = e.target.value;
            }
            document.querySelector("#length2Value").innerHTML = pendulums[0].length2;
            break;
    }
}

// Event to change the dampening value.
function changeDampening(e){
    for(let i = 0; i < pendulums.length; i++){
        pendulums[i].dampening = e.target.value / (100000.0 * 5);
    }
    document.querySelector("#dampeningValue").innerHTML = e.target.value;
}

// Main loop
function update(){
    // Clear the canvas
    foregroundCtx.clearRect(0, 0, utils.canvasSize, utils.canvasSize);
    let alpha = .4;

    // Perform update and draw on the remaining pendulums.
    for(let i = 0; i < pendulums.length; i++){
        pendulums[i].update(isRunning);
        if(showPendulums){
            pendulums[i].draw(isRunning, nightTime, foregroundCtx, tracingCtx, alpha, nameToGlow);
        }
    }
    // Draw static images on lower level canvas layers.
    utils.drawBackground(backgroundCtx, nightTime);
    utils.drawGraphLines(tracingCtx, nightTime);

    timer += 1/60;
    // Only make calculation about every half a second since it is computationally expensive.
    if(timer > .5){
        let kinetic = Math.round(utils.calculatePotential(pendulums) * 10) / 10
        let potential = Math.round(utils.calculateKinetic(pendulums, isRunning) * 10) / 10;
        averagePotentialText.innerHTML = "&nbsp" + kinetic;
        averageKineticText.innerHTML = "&nbsp" + potential;
        timer = 0;
    }
    // Repeat.
    setTimeout(update, 0);
}

export {init}