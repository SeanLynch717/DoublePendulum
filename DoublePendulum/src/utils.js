"use strict";
// Constant passes up through exporting
const canvasSize = 900;

// Draws a line between the two input points, used for drawing tracing lines each frame.
function drawTracingLine(ctx, x1, y1, x2, y2, color, alpha) {
    let start = pointToCanvasSpace(x1, y1);
    let end = pointToCanvasSpace(x2, y2);
    drawLine(ctx, start[0], start[1], end[0], end[1], 2, color, alpha);
}

// Pure function for drawing a line.
function drawLine(ctx, x1, y1, x2, y2, lw, color, alpha, glow){
    ctx.save();
    ctx.globalAlpha = alpha
    ctx.lineWidth = lw;
    ctx.strokeStyle = color;
    // Should glow?
    if(glow){
        ctx.shadowColor = 'yellow';
        ctx.shadowBlur = 5;
        ctx.strokeStyle = 'yellow';
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

// Pure function for drawing a ball.
function drawBall(ctx, x1, y1, radius, color, glow){
    ctx.save();
    ctx.fillStyle = color;
    if(glow){
        ctx.shadowColor = 'yellow';
        ctx.shadowBlur = 5;
        ctx.fillStyle = 'yellow';
    }
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2*Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Draws the background based on if it's day or night time.
function drawBackground(ctx, nightTime){
    let backgroundColor = nightTime ? 'black' : 'white';
    drawRect(ctx, backgroundColor, 1);
}

// Draw the graphing lines on the canvas.
function drawGraphLines(ctx, nightTime){
    if(nightTime) return;
    let lineColor = 'black'
    let delta = 50;
    for(let i = 0; i <= canvasSize; i+= delta){
        drawLine(ctx, i, 0, i, canvasSize, .5, lineColor, 1, false);
        drawLine(ctx, 0, i, canvasSize, i, .5, lineColor, 1, false);
    }
}

// Pure function for drawing a rectangle.
function drawRect(ctx, color, alpha){
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.restore();
}

// Converts a point in local space to world space.
function pointToCanvasSpace(relX, relY){
    let vec2 = [relX + canvasSize / 2, relY + canvasSize / 2];
    return vec2;
}

// Gets a random color. Taken from the spritey assignment.
function getRandomColor(){
    const getByte = _ => 35 + Math.round(Math.random() * 220);
    return `rgba(${getByte()},${getByte()},${getByte()},1)`;
}

// Caclulates the average potential energy of the pendulum system.
function calculatePotential(pendulums){
    let potential = 0;
    let baseLine = pendulums[0].length1 + pendulums[0].length2;
    for(let i = 0; i < pendulums.length; i++){
        let height1 = baseLine - pendulums[i].y1;
        let height2 = baseLine - pendulums[i].y2;
        // U = mgh
        potential += pendulums[i].mass1 * pendulums[i].gravity * height1;
        potential += pendulums[i].mass2 * pendulums[i].gravity * height2;
    }
    potential /= pendulums.length;
    return potential;
}

// Calculates the average kinetic enery of the pendulum system.
function calculateKinetic(pendulums, isRunning){
    if(!isRunning) return 0;
    let kinetic = 0;
    for(let i = 0; i < pendulums.length; i++){
        // k = 1/2 m v^2
        kinetic += 0.5 * pendulums[i].mass1 * Math.pow(pendulums[i].velocity1 * (15 + pendulums[i].mass1 * 150.0), 2);
        kinetic += 0.5 * pendulums[i].mass2 * Math.pow(pendulums[i].velocity2 * (15 + pendulums[i].mass2 * 150.0), 2);
    }
    kinetic /= pendulums.length;
    return kinetic * 1000;
}

export{drawTracingLine, drawBackground, drawBall, drawLine, pointToCanvasSpace, drawGraphLines, getRandomColor, calculateKinetic, calculatePotential, canvasSize}