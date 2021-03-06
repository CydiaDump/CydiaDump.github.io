var weatherCode = weather.icon();
//var weatherCode = 3;
var snowCodes = [5, 6, 7, 13, 14, 15, 16, 41, 42, 43, 46]; // Weather codes that include snow in some way
var rainCodes = [1, 2, 3, 4, 8, 9, 10, 11, 12, 17, 18, 35, 37, 38, 39, 40, 42, 45, 47];
//var cloudCodes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 26, 27, 28, 29, 30, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
var cloudCodes = [0, 19, 20, 21, 22, 26, 27, 28, 29, 30, 44, 34, 33];
var SVGAnimate;
var CloudAni;
var starsOut = true;

var weatherParts = [];

if (snowCodes.indexOf(weatherCode) > -1) {
    weatherParts.push('snow');
    SVGAnimate = true;
    starsOut = false;

}
if (rainCodes.indexOf(weatherCode) > -1) {
    weatherParts.push('rain');
    SVGAnimate = true;
    starsOut = false;
}
if (cloudCodes.indexOf(weatherCode) > -1) {
    CloudAni = true;
    starsOut = false;
}
//RAIN/SNOW
var canvas = null;
var context = null;
var bufferCanvas = null;
var bufferCanvasCtx = null;
var flakeArray = {};
var flakeTimer = {};
//var maxFlakes = (snowCodes) ? 100 : 20;
var flakeProperties = {
    'snow': {
        'max': 40,
        'spawnDelay': 200
    },
    'rain': {
        'max': 20,
        'spawnDelay': 200,
        'minSpeed': 7,
        'maxSpeed': 13,
        'minSize': 3,
        'maxSize': 5
    }
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomNum(min, max) {
    return Math.random() * (max - min + 1) + min;
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function Flake(type) {
    this.type = type;
    switch (type) {
    case 'rain':
        this.speed = {
            'x': 1,
            'y': randomInt(flakeProperties['rain']['minSpeed'], flakeProperties['rain']['maxSpeed'])
        };
        this.width = randomInt(flakeProperties['rain']['minSize'], flakeProperties['rain']['maxSize']);
        this.y = -10;
        this.position = {
            'xLeft': this.width / 2,
            'xRight': this.width / 2,
            'yUp': 7,
            'yDown': this.width / 2
        }
        break;
    case 'snow':
        this.width = (Math.random() * 3) + 2;
        this.speed = {
            'x': Math.random(),
            'y': Math.round(Math.random() * 5) + 1
        };
        this.position = {
            'xLeft': this.width / 2,
            'xRight': this.width / 2,
            'yUp': 7,
            'yDown': this.width / 2
        }
        this.y = -10;
        break;
    }
    this.x = Math.round(Math.random() * context.canvas.width);
    //this.y = -10;
    this.height = this.width;
    this.drawToCanvas = function (ctx) {
        switch (type) {
        case 'rain':
            ctx.fillStyle = dropColor;
            ctx.beginPath();
            ctx.moveTo(this.x - this.width / 2, this.y);
            ctx.lineTo(this.x, this.y - 7);
            ctx.lineTo(this.x + this.width / 2, this.y);
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI);
            break;
        case 'snow':
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 10, 0, true);
            break;
        }
        ctx.closePath();
        ctx.fill();
    };
}

function SVGinit() {
    canvas = document.getElementById('canvasRain');
    context = canvas.getContext("2d");
    bufferCanvas = document.createElement("canvas");
    bufferCanvasCtx = bufferCanvas.getContext("2d");
    bufferCanvasCtx.canvas.width = context.canvas.width;
    bufferCanvasCtx.canvas.height = context.canvas.height;
    addFlakes();
    Draw();
    (function animloop() {
        requestAnimFrame(animloop);
        animate();
    })();
}

function addFlakes() {
    for (var i = 0; i < weatherParts.length; i++) {
        flakeArray[weatherParts[i]] = []; // Create an empty array for each of the flake types

        if (flakeProperties[weatherParts[i]]['spawnDelay']) { // If it's something that should be introduced over a delay
            var weatherType = weatherParts[i];
            flakeTimer[weatherParts[i]] = setInterval(function () {
                addFlake(weatherType)
            }, flakeProperties[weatherParts[i]]['spawnDelay']); // Incrementally introduce the flakes
        } else { // They should all be introduced at the same time
            for (var k = 0; k < flakeProperties[weatherParts[i]]['max']; k++) {
                addFlake(weatherParts[i]);
            }
        }
    }
}

function addFlake(weatherType) {
    flakeArray[weatherType].push(new Flake(weatherType));
   // console.log('WeatherType: ' + weatherType + ',' + flakeArray[weatherType].length + ',' + flakeProperties[weatherType]['max']);
    if (flakeArray[weatherType].length === flakeProperties[weatherType]['max'] && flakeTimer[weatherType]) { // If we've hit the max, and just verify it exists to prevent errors
        clearInterval(flakeTimer[weatherType]);
       // console.log('Cleared');
    }
}

function blank() {
    context.save();
    bufferCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function animate() {
    Update();
    Draw();
}

function Update() {
    Object.keys(flakeArray).forEach(function (key) {
        for (var i = 0; i < flakeArray[key].length; i++) {
            if (flakeArray[key][i].y - flakeArray[key][i].position['yUp'] <= context.canvas.height) {
                flakeArray[key][i].y += flakeArray[key][i].speed.y;
                if (flakeArray[key][i].y - flakeArray[key][i].position['yUp'] > context.canvas.height) // If it's gone beyond the bottom of the screen
                    flakeArray[key][i].y = flakeArray[key][i].position['yDown'] * -1;
                flakeArray[key][i].x += flakeArray[key][i].speed.x;
                if (flakeArray[key][i].x - flakeArray[key][i].position['xLeft'] > context.canvas.width)
                    flakeArray[key][i].x = flakeArray[key][i].position['xRight'] * -1;
            }
        }
    });
}

function Draw() {
    context.save();
    blank();
    Object.keys(flakeArray).forEach(function (key) { // Go through each of the arrays for each type of flake
        for (var i = 0; i < flakeArray[key].length; i++) { // Go through each flake in this type
            flakeArray[key][i].drawToCanvas(bufferCanvasCtx); // Call its draw function
        }
    });
    context.drawImage(bufferCanvas, 0, 0, bufferCanvas.width, bufferCanvas.height);
    context.restore();
}

if (SVGAnimate) {
    SVGinit();
}
//END RAIN/SNOW

//CLOUDS
var leftMax = -250; // start point.
var topNum = randomNum(-50, 100); //random top position
var speed = 0.5; // cloud speed
var variationCount = 6; // how many variations in switch statement
var imgWidth = 400;
var imgHeight = 200;
var randomStep = Math.round(randomNum(1,variationCount) - 1);
var step = randomStep > 0 ? randomStep : 2; //randomize start
function clearCanvas() {
    cont.save();
    buffercvCtx.clearRect(0, 0, 320, 568);
    cont.clearRect(0, 0, 320, 568);
}

function AniCloud(ctx, image1, image2, image3) {
    leftMax = leftMax + speed;
    if (leftMax === 310) {
        leftMax = -440;
        topNum = randomNum(0, 100);
        step++
        if(step > variationCount){
            step = 1;
        }// = ((step + 1) < variationCount) ? step + 1 : 1;
    }
    ctx.save();
    clearCanvas();
    switch (step) {
    case 1:
        ctx.drawImage(image1, leftMax, topNum, imgWidth, imgHeight);
       // ctx.drawImage(image2, leftMax, topNum - 50, imgWidth, imgHeight);
        break;
    case 2:
        ctx.drawImage(image3, leftMax, topNum, imgWidth, imgHeight);
        //ctx.drawImage(image1, leftMax - 5, topNum + 10, imgWidth, imgHeight);
        break;
    case 3:
        ctx.drawImage(image2, leftMax, topNum, imgWidth, imgHeight);
        break;
    case 4:
        ctx.drawImage(image2, leftMax, topNum + 20, imgWidth, imgHeight);
        break;
    case 5:
        ctx.drawImage(image1, leftMax, topNum, imgWidth, imgHeight);
        ctx.drawImage(image2, leftMax, topNum - 10, imgWidth, imgHeight);
        break;
    case 6:
        ctx.drawImage(image3, leftMax, topNum, imgWidth, imgHeight);
        ctx.drawImage(image2, leftMax, topNum - 10, imgWidth, imgHeight);
        break;
    }

}

function Cloudinit() {
    cloudCanvas = document.getElementById('canvasCloud');
    ccontext = cloudCanvas.getContext("2d");
    buffercv = document.createElement("canvas");
    buffercvCtx = buffercv.getContext("2d");
    buffercvCtx.canvas.width = ccontext.canvas.width;
    buffercvCtx.canvas.height = ccontext.canvas.height;
    DrawClouds();
}

function DrawClouds() {
    var cloudCanvas = document.getElementById('canvasCloud');
    cont = cloudCanvas.getContext("2d");
    var imageObj = new Image();
    var imageObj2 = new Image();
    var imageObj3 = new Image();
    imageObj.onload = function () {
        (function animloop() {
            requestAnimFrame(animloop);
            AniCloud(cont, imageObj, imageObj2, imageObj3);
        })();
    };
    imageObj.src = 'animation/cloud1.png';
    imageObj2.src = 'animation/cloud2.png';
    imageObj3.src = 'animation/cloud3.png';
}
if (CloudAni) {
    //if(SVGAnimate !== true){
    Cloudinit();
    //}
}
//END CLOUDS

//Start Stars
var cstarWidth;
var cstarHeight;
var cStarCanvas;
var con;
var g;
var pxs = [];
var rint = 10;
var starAmount = 50;

function createStar() {
    cstarWidth = 320;
    cstarHeight = 200;

    cStarCanvas = document.getElementById('canvasStar');
    con = cStarCanvas.getContext('2d');

    for (var i = 0; i < starAmount; i++) {
        pxs[i] = new Circle();
        pxs[i].reset();
    }

    setInterval(drawstar, rint);
}

function drawstar() {
    con.clearRect(0, 0, cstarWidth, cstarHeight);
    for (var i = 0; i < pxs.length; i++) {
        pxs[i].fadestar();
        if (i == 18) {
            pxs[i].movestar();
        }
        pxs[i].drawstar();
    }
}

function Circle() {
    this.s = {
        timetolive: 1000,
        xspeed: 20,
        yspeed: 4,
        radius: 0.5,
        rt: 1,
        xorigin: 320,
        yorigin: 10,
        xdrift: 4,
        ydrift: 3,
        random: true,
        blink: true
    };

    this.reset = function () {
        this.x = (this.s.random ? cstarWidth * Math.random() : this.s.xorigin);
        this.y = (this.s.random ? cstarHeight * Math.random() - 50 : this.s.yorigin - 50);
        this.r = ((this.s.radius - 1) * Math.random()) + 1;
        this.dx = (Math.random() * this.s.xspeed) * (Math.random() < .5 ? -1 : 1);
        this.dy = (Math.random() * this.s.yspeed) * (Math.random() < .5 ? -1 : 1);
        this.hl = (this.s.timetolive / rint) * (this.r / this.s.radius);
        this.rt = Math.random() * this.hl;
        this.s.rt = Math.random() + 1;
        this.stop = Math.random() * .2 + .4;
        this.s.xdrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
        this.s.ydrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
    }

    this.fadestar = function () {
        this.rt += this.s.rt;
    }

    this.drawstar = function () {
        if (this.s.blink && (this.rt <= 0 || this.rt >= this.hl)) this.s.rt = this.s.rt * -1;
        else if (this.rt >= this.hl) this.reset();
        var newo = 1 - (this.rt / this.hl);
        con.beginPath();
        con.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        con.closePath();
        //var cr = this.r*newo;
        //g = con.createRadialGradient(this.x,this.y,0,this.x,this.y,(cr <= 0 ? 1 : cr));
        //g.addColorStop(0.0, 'rgba(255,255,255,'+newo+')');
        //g.addColorStop(this.stop, 'rgba(255,255,255,'+(newo*.6)+')');
        //g.addColorStop(1.0, 'rgba(77,101,181,0)');
        //con.fillStyle = g;
        /*iOS doesn't like radial Gradients*/
        con.fillStyle = 'rgba(255,255,255,' + newo + ')';
        con.fill();
    }

    this.movestar = function () {
        this.x += (this.rt / this.hl) * this.dx;
        this.y += (this.rt / this.hl) * this.dy;
        //if(this.x > cstarWidth || this.x < 0) this.dx *= -1;
        if (this.y > cstarHeight - 50 || this.y < 0) this.dy *= -1;
    }

    //this.getX = function() { return this.x; }
    //this.getY = function() { return this.y; }
}

var hr = (new Date()).getHours();
// && starsOut === true
if (hr >= 17 && starsOut === true) {
    createStar();
}