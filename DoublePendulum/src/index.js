"use strict";
// #1 - wait for page to load
window.onload = init; 

let ctx; 

let gravity;
let timeStep;
let ballRadius;
let mass1;
let mass2;
let length1;
let length2;
let angle1;
let angle2;
let velocity1;
let velocity2;
let acceleration1 = .001;
let acceleration2 = .001;
let x1;
let y1;
let x2;
let y2;

function init(){
    console.log("init() called");
    // get pointer to <canvas> element on page
    let canvas = document.querySelector('canvas');
    
    // get pointer to "drawing context" and drawing API
    ctx = canvas.getContext('2d');
    // default values;
    gravity = .1;
    mass1 = 1;
    mass2 = 1;
    ballRadius = 20;
    length1 = 150;
    length2 = 150;
    angle1 = 3 * Math.PI / 4;
    angle2 = 4 * Math.PI / 6;
    velocity1 = .0;
    velocity2 = .0;
    update();
}
function update(){
    ctx.clearRect(0, 0, 700, 700);
    // Calculate new positions.
    x1 = length1 * Math.sin(angle1);
    y1 = length1 * Math.cos(angle1);
    x2 = x1 + length2 * Math.sin(angle2);
    y2 = y1 + length2 * Math.cos(angle2);
    // Draw the current state of the pendulum
    sdlLIB.drawPendulumSystem(ctx, 0, 0, x1, y1, x2, y2, ballRadius);
    // Calculate the acceleration of each point mass, and apply the acceleration to the system.
    let accelerations = sdlLIB.calculateAcceleration(gravity, mass1, mass2, length1, length2, angle1, angle2, velocity1, velocity2);
    velocity1 += accelerations[0];
    velocity2 += accelerations[1];
    angle1 += velocity1;
    angle2 += velocity2;
    setTimeout(update, 0);
}