import * as utils from "./utils.js"
"use strict";
// Class that holds data and functionality required for updating and drawing a double pendulum.
class DoublePendulum{
    // Parameterized constructor.
    constructor(gravity, dampening, mass1, mass2, length1, length2, angle1, angle2, timeScale, color1, color2){
        this.gravity = gravity;
        this.dampening = dampening;
        this.mass1 = mass1;
        this.mass2 = mass2;
        this.length1 = length1;
        this.length2 = length2;
        this.angle1 = angle1;
        this.angle2 = angle2;
        this.timeScale = timeScale;
        this.color1 = color1;
        this.color2 = color2;
        this.velocity1 = 0;
        this.velocity2 = 0;
        this.x1;
        this.x2;
        this.y1;
        this.y2;
        this.previousPoint = [];
    }

    // Called by main to update the position of the pendulum.
    update(isRunning){
        this.previousPoint[0] = [this.x1, this.y1];
        this.previousPoint[1] = [this.x2, this.y2]
        // Calculate new positions.
        this.x1 = this.length1 * Math.sin(this.angle1);
        this.y1 = this.length1 * Math.cos(this.angle1);
        this.x2 = this.x1 + this.length2 * Math.sin(this.angle2);
        this.y2 = this.y1 + this.length2 * Math.cos(this.angle2);

        // Simulation is paused, so zero out the velocity.
        if(!isRunning){
            this.velocity1 = 0;
            this.velocity2 = 0;
            return;
        }

        // Calculate the acceleration of each point mass, and apply the acceleration to the system.
        let accelerations = this.calculateAcceleration(this.gravity, this.mass1, this.mass2, this.length1,
             this.length2, this.angle1, this.angle2, this.velocity1, this.velocity2);
        this.velocity1 += accelerations[0] * this.timeScale;
        this.velocity2 += accelerations[1] * this.timeScale;
        if(this.velocity1 > this.dampening){this.velocity1 -= this.dampening;}
        else if(this.velocity1 < -this.dampening){this.velocity1 += this.dampening;}
        if(this.velocity2 > this.dampening){this.velocity2 -= this.dampening;}
        else if(this.velocity2 < -this.dampening){this.velocity2 += this.dampening;}
        this.angle1 += this.velocity1;
        this.angle2 += this.velocity2;
    }

    // Called by main to draw the pendulum system, and the tracing lines.
    draw(isRunning, nightTime, foregroundCtx, middleGroundCtx, alpha, nameToGlow){
        // Draw the current state of the pendulum
        this.drawPendulumSystem(foregroundCtx, 0, 0, this.x1, this.y1, this.x2, this.y2, 15 + this.mass1 * 150.0, 15 + this.mass2 * 150.0, nightTime, this.color1, this.color2, nameToGlow);
        if(!isRunning) return;
        // Draw the tracing lines
        utils.drawTracingLine(middleGroundCtx, this.previousPoint[1][0], this.previousPoint[1][1], this.x2, this.y2, this.color2, alpha);
        // utils.drawTracingLine(middleGroundCtx, this.previousPoint[0][0], this.previousPoint[0][1], this.x1, this.y1, this.color1, nightTime, alpha)
    }

    // Caclulate the acceleration using the Runge Kutta method.
    calculateAcceleration(g, m1, m2, l1, l2, a1, a2, v1, v2){
        let acceleration1;
        let acceleration2;
    
        // Calculate acceleration1, splitting up terms for readability.
        let num1 = -g * (2 * m1 + m2) * Math.sin(a1);
        let num2 = -m2 * g * Math.sin(a1 - 2 * a2);
        let num3 = -2 * Math.sin(a1 - a2) * m2;
        let num4 = Math.pow(v2, 2) * l2 + Math.pow(v1, 2) * l1 * Math.cos(a1 - a2);
        let den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
        acceleration1 = (num1 + num2 + num3 * num4) / (den);
    
        // Calculate acceleration2, splitting up terms for readability.
        num1 = 2 * Math.sin(a1 - a2);
        num2 = Math.pow(v1, 2) * l1 * (m1 + m2);
        num3 = g * (m1 + m2) * Math.cos(a1);
        num4 = Math.pow(v2, 2) * l2 * m2 * Math.cos(a1 - a2);
        den = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
        acceleration2 = (num1 * (num2 + num3 + num4)) / den;
    
        // Return the accelerations as an array.
        let vec2 = [acceleration1, acceleration2];
        return vec2;
    }

    // Draws all components of the pendulum system.
    drawPendulumSystem(ctx, relativeStartX, relativeStartY, relativeMidX, relativeMidY, relativeEndX, relativeEndY, ball1Radius, ball2Radius, isNightTime, color1, color2, nameToGlow){
        // Get the three points that define the double pendulum, and convert them screen space.
        let canvasStartPosition = utils.pointToCanvasSpace(relativeStartX, relativeStartY);
        let canvasStartX = canvasStartPosition[0];
        let canvasStartY = canvasStartPosition[1];
        let canvasMidPosition = utils.pointToCanvasSpace(relativeMidX, relativeMidY);
        let canvasMidX = canvasMidPosition[0];
        let canvasMidY = canvasMidPosition[1];
        let canvasEndPosition = utils.pointToCanvasSpace(relativeEndX, relativeEndY);
        let canvasEndX = canvasEndPosition[0];
        let canvasEndY = canvasEndPosition[1];   

        let lineColor = isNightTime ? 'white':'black';
        // Draw the lines connecting each mass.
        utils.drawLine(ctx, canvasStartX, canvasStartY, canvasMidX, canvasMidY, 3, lineColor, 1, nameToGlow.includes('length1'));
        utils.drawLine(ctx, canvasMidX, canvasMidY, canvasEndX, canvasEndY, 3, lineColor, 1, nameToGlow.includes('length2'))
    
        // Draw both weights.
        utils.drawBall(ctx, canvasMidX, canvasMidY, ball1Radius, color1, nameToGlow.includes('mass1'));
        utils.drawBall(ctx, canvasEndX, canvasEndY, ball2Radius, color2, nameToGlow.includes('mass2'));
    }
}

export {DoublePendulum}