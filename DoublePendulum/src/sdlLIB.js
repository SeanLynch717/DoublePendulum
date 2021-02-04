(function(){
    let sdlLIB = {

        drawPendulumSystem(ctx, relativeStartX, relativeStartY, relativeMidX, relativeMidY, relativeEndX, relativeEndY, ballRadius){
            let canvasStartPosition = sdlLIB.pointToCanvasSpace(relativeStartX, relativeStartY);
            let canvasStartX = canvasStartPosition[0];
            let canvasStartY = canvasStartPosition[1];
            let canvasMidPosition = sdlLIB.pointToCanvasSpace(relativeMidX, relativeMidY);
            let canvasMidX = canvasMidPosition[0];
            let canvasMidY = canvasMidPosition[1];
            let canvasEndPosition = sdlLIB.pointToCanvasSpace(relativeEndX, relativeEndY);
            let canvasEndX = canvasEndPosition[0];
            let canvasEndY = canvasEndPosition[1];

            // Draw both lines
            sdlLIB.drawRectangle(ctx, canvasStartX, canvasStartY, canvasMidX, canvasMidY);
            sdlLIB.drawRectangle(ctx, canvasMidX, canvasMidY, canvasEndX, canvasEndY);
            
            // Draw both balls
            sdlLIB.drawBall(ctx, canvasMidX, canvasMidY, ballRadius);
            sdlLIB.drawBall(ctx, canvasEndX, canvasEndY, ballRadius);
        },
        drawRectangle(ctx, x1, y1, x2, y2){
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        },
        drawBall(ctx, x1, y1, radius){
            ctx.save();
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(x1, y1, radius, 0, 2*Math.PI, false);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        pointToCanvasSpace(relX, relY){
            let vec2 = [relX + 350, relY + 350];
            return vec2;
        },
        calculateAcceleration(g, m1, m2, l1, l2, a1, a2, v1, v2){
            let acceleration1;
            let acceleration2;

            let num1 = -g * (2 * m1 + m2) * Math.sin(a1);
            let num2 = -m2 * g * Math.sin(a1 - 2 * a2);
            let num3 = -2 * Math.sin(a1 - a2) * m2;
            let num4 = Math.pow(v2, 2) * l2 + Math.pow(v1, 2) * l1 * Math.cos(a1 - a2);
            let den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));

            acceleration1 = (num1 + num2 + num3 * num4) / (den);

            num1 = 2 * Math.sin(a1 - a2);
            num2 = Math.pow(v1, 2) * l1 *(m1 + m2);
            num3 = g * (m1 + m2) *Math.cos(a1);
            num4 = Math.pow(v2, 2) * l2 * m2 * Math.cos(a1 - a2);
            den = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
            acceleration2 = (num1 * (num2 + num3 + num4)) / den;

            let vec2 = [acceleration1, acceleration2];
            return vec2;
        },
    };
    if(window){
        window["sdlLIB"] = sdlLIB;
    }
    else{
        throw "'window' is not defined!";
    }
})();