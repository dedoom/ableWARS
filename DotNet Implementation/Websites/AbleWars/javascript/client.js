var io = require('socket.io-client'),
    socket = io.connect('http://localhost:4000');
var points = 0;
var pointsToWin = 10;
var screenWidth = 1000;
var player = 0;
var round = -1;
var shapes = ["Triangle_blue.png", "Rectangle_blue.png", "Circle_blue.png", "Triangle_yellow.png", "Rectangle_yellow.png", "Circle_yellow.png", "Triangle_red.png", "Rectangle_red.png", "Circle_red.png", "Triangle_green.png", "Rectangle_green.png", "Circle_green.png"];
var matchNum;

$(document).ready(function () {
    //create an onClick event for each <div> in the playing field to remove itself and increment player
    $("#playingField").on("click", "div", function (event) {
        if ($(this).id.equals(round + "shape" + 0)) {
            var timestamp = Date.now();
            socket.emit('targetShapeClick', { matchNum: matchNum, timeStamp: timestamp});
        }
        $(this).remove();
    });
});

socket.on('startGame', function (data) {
    counter = 3;
    matchNum = data['matchNum'];
    interval = setInterval(function () { startInterval(data['shapes']) }, 1000);
});

function startInterval(shapes) {
    counter--;
    if (counter != 0) {
        $("#timer").text(counter);
    }
    else {
        $("#timer").text("Go!");
        clearInterval(interval);
        newShapes(shapes);
    }
}

socket.on('newShapes', function (shapes) {
    newShapes(shapes);
});

function newShapes(shapes) {
    round++;
    for (i = 0; i < shapes.length; i++) {
        $("#playingField").append("<div style='display:block' id ='" + round + "shape" + i + "'><img class='shapeInPlay' src='../img/shapes/" + shapes[picker] + "'></div>");

        var randPosX = Math.floor((Math.random() * ($("#playingField").width() - shapes[i]['width'])));
        var randPosY = Math.floor((Math.random() * ($("#playingField").height() - shapes[i]['height'])));

        $("#" + round + "shape" + i).css("width", shapes[i]['width']);
        $("#" + round + "shape" + i).css("height", shapes[i]['height']);
        $("#" + round + "shape" + i).children().css("width", shapes[i]['width']);
        $("#" + round + "shape" + i).children().css("height", shapes[i]['height']);
        $("#" + round + "shape" + i).css('left', randPosX);
        $("#" + round + "shape" + i).css('top', randPosY);
    }
}

socket.on('point', function () {
    points++;
    repositionPlayers();
    if (points == pointsToWin){
        socket.emit('win', matchNum);
    }
});

socket.on('losePoint', function () {
    points--;
    repositionPlayers();
});

function repositionPlayers() {
    if (player == 1){
        var left = (screenWidth / 4) - ((screenWidth / (pointsToWin * 4)) * points);
        $("#player1").css('left', left);
        $("#player2").css('left', left + (screenWidth / 2));
    }
    else {
        var left = (screenWidth / 4) + ((screenWidth / (pointsToWin * 4)) * points);
        $("#player2").css('left', left);
        $("#player1").css('left', left - (screenWidth / 2));
    }
}

socket.on('win', function () {
    alert("You win!!");
});

socket.on('lose', function () {
    alert("You lost :(");
});