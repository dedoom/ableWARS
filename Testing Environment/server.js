/*starting match
- server recieves clientConnect, server checks if it has a client1 waiting already
{
    false- server stores client1's id
	- if client1 disconnects before match-up, server discards client1's id and waits for new client1
    true- client2 connects, server assigns match# to both clients & sends identical shapes list with sizes + first target shape
}
- client clicks target shape & sends targetShapeClick w/ timestamp + match#, server recieves targetShapeClick & checks if client's partner's targetShapeWasClicked is true
{
    false- sends point to client, sends new shapelist + target shape to both clients
    true- discard
}
- client reaches point goal & sends win to server w/ match#
- server sends gameOver to clients and drops clients + match# from records*/

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server),
    path = require('path');

var clientCount = 0;
var clientWaiting = false;
var waitingSocket;
var matches = [];
var numOfMatches = 0;

app.use(express.static(path.join(__dirname + '/')));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

server.listen(4000, function () {
    console.log("listening on port 4000");
});

io.on('connection', function (socket) {
	console.log("client connected");
    if (!clientWaiting) {
        clientWaiting = true;
        waitingSocket = socket;
    }
    else {
        clientWaiting = false;
        var match = { matchNum: numOfMatches, player1: { socket: waitingSocket, targetTimestamp: 0 }, player2: { socket: socket, targetTimestamp: 0 } }
        matches.push(match);
        numOfMatches++;

        var shapes = getShapes();
        socket.emit('startGame', { matchNum: match['matchNum'], shapes: shapes, player: 2 });
        waitingSocket.emit('startGame', { matchNum: match['matchNum'], shapes: shapes, player: 1 });
    }

    socket.on('targetShapeClick', function (data) {
		//console.log(data['matchNum']);
        var match = matches[data['matchNum']];
        var player = 0, opponent = 0;
        if (match['player1']['socket'] == socket){
            player = 1;
            opponent = 2;
        }
        else {
            player = 2;
            opponent = 1;
        }
		//console.log("player: " + player + "  opponent: " + opponent);
        if (match['player' + player]['targetTimestamp'] == 0){
            match['player' + player]['targetTimestamp'] = data['timestamp'];
			//console.log("first");
        }
        if (match['player' + opponent]['targetTimestamp'] != 0) {
			//console.log("second");
            if (match['player' + player]['targetTimestamp'] < match['player' + opponent]['targetTimestamp']) {
                socket.emit('point');
                match['player' + opponent]['socket'].emit('losePoint');
            }
            else {
                match['player' + opponent]['socket'].emit('point');
                socket.emit('losePoint');
            }
            var shapes = getShapes();
            socket.emit('newShapes', shapes);
            match['player' + opponent]['socket'].emit('newShapes', shapes);

            match['player' + player]['targetTimestamp'] = 0;
            match['player' + opponent]['targetTimestamp'] = 0;
        }
    });

    socket.on('win', function (matchNum) {
        var opponent = 0;
		var match = matches[matchNum];
        if (match['player1']['socket'] == socket) {
            opponent = 2;
        }
        else {
            opponent = 1;
        }
        socket.emit('win');
        match['player' + opponent]['socket'].emit('lose');
    });
});

function getShapes() {
    var shapeCount = 1 + Math.round(Math.random() * 10);
	//var shapeCount = 1;
    var shapes = [];
    for (var i = 0; i < shapeCount; i++) {
        shapes.push(getNewShape(i));
    }

    return shapes;
}

function getNewShape(i) {
    var id = i;
    var picker = Math.floor((Math.random() * 12));
    var width = Math.floor((Math.random() * 200));
    var height = Math.floor((Math.random() * 200));

    return { id: id, picker: picker, width: width, height: height};
}