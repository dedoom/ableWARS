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
var waitingPlayerID;
var newShapes;
var needNewShapes = true;
var shapesPerRequest = 5;

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
		waitingPlayerID = Date.now();
    }
    else {
		var player2ID = Date.now();
        var match = { matchID: "match:" + waitingPlayerID + ":" + player2ID, player1: { playerID: waitingPlayerID, socket: waitingSocket, targetTimestamp: 0 }, player2: { playerID: player2ID, socket: socket, targetTimestamp: 0 }, higherScore: -1 };
		matches.push(match);
        numOfMatches++;

        var shapes = getShapes();
        socket.emit('startGame', { matchID: match['matchID'], shapes: shapes, player: 2, playerID: player2ID });
        waitingSocket.emit('startGame', { matchID: match['matchID'], shapes: shapes, player: 1, playerID: waitingPlayerID });
		
		waitingSocket = null;
		clientWaiting = false;
		waitingPlayerID = null;
    }
	
	socket.on('disconnect', function(){
		console.log("client disconnected");
		if (socket == waitingSocket){
			console.log("waiting socket client disconnected");
			clientWaiting = false;
			waitingSocket = null;
		}
		else {
			for (var m = 0; m < matches.length; m++){
				if (matches[m]['player1']['socket'] == socket){
					console.log("match found after spliced!");
					matches[m]['player2']['socket'].emit('winByDisconnect');
					matches.splice(m, 1);
				}
				else if (matches[m]['player2']['socket'] == socket){
					console.log("match found after spliced!");
					matches[m]['player1']['socket'].emit('winByDisconnect');
					matches.splice(m, 1);
				}
			}
		}
	});

    socket.on('targetShapeClick', function (data) {
		//console.log(data['matchID']);
        var match = getMatchByID(data['matchID']);
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
                match['player' + opponent]['socket'].emit('losePoint', data['shapeID']);
            }
            else {
                match['player' + opponent]['socket'].emit('point');
                socket.emit('losePoint', data['shapeID']);
            }
            var shapes = getShapes();
            socket.emit('newShapes', shapes);
            match['player' + opponent]['socket'].emit('newShapes', shapes);

            match['player' + player]['targetTimestamp'] = 0;
            match['player' + opponent]['targetTimestamp'] = 0;
        }
    });
	
	socket.on('shapesRequest', function(){
		if (needNewShapes){
			newShapes = getShapes();
			needNewShapes = false;
		}
		else {
			needNewShapes = true;
		}
        socket.emit('newShapes', newShapes);
	});

	socket.on('shapeClick', function (data) {
		//console.log(data['matchID']);
        var match = getMatchByID(data['matchID']);
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
        socket.emit('point');
        match['player' + opponent]['socket'].emit('losePoint', data['shapeID']);
    });
	
	socket.on('timeUp', function(data){
		var matchIndex = getIndexOfMatchByID(data['matchID']);
		var match = getMatchByID(data['matchID']);
		var score = data['score'];
		//console.log("matchIndex = " + matchIndex + "\nhigherScore = " + parseInt(matches[matchIndex]['higherScore']) + "\nscore = " + score);
		if (parseInt(matches[matchIndex]['higherScore']) < 0){
			matches[matchIndex]['higherScore'] = score;
		}
		else {
			var opponent = 0;
			if (match['player1']['socket'] == socket) {
				opponent = 2;
			}
			else {
				opponent = 1;
			}
			if (score > parseInt(matches[matchIndex]['higherScore'])){
				match['player' + opponent]['socket'].emit('lose');
				matches.splice(getIndexOfMatchByID(data['matchID']), 1);
				socket.emit('win');
			}
			else if (score < parseInt(matches[matchIndex]['higherScore'])){
				match['player' + opponent]['socket'].emit('win');
				matches.splice(getIndexOfMatchByID(data['matchID']), 1);
				socket.emit('lose');
			}
			else {
				match['player' + opponent]['socket'].emit('tie');
				matches.splice(getIndexOfMatchByID(data['matchID']), 1);
				socket.emit('tie');
			}
		}
	});
	
    socket.on('win', function (matchID) {
        var opponent = 0;
		var match = getMatchByID(matchID);
        if (match['player1']['socket'] == socket) {
            opponent = 2;
        }
        else {
            opponent = 1;
        }
        socket.emit('win');
        match['player' + opponent]['socket'].emit('lose');
		matches.splice(getIndexOfMatchByID(matchID), 1);
    });
});

function getMatchByID(matchID){
	for (var m = 0; m < matches.length; m++){
		if (matches[m]['matchID'] == matchID){
			return matches[m];
		}
	}
	return null;
}

function getIndexOfMatchByID(matchID){
	for (var m = 0; m < matches.length; m++){
		if (matches[m]['matchID'] == matchID){
			return m;
		}
	}
	return null;
}

function getShapes() {
    var shapeCount = 1 + Math.round(Math.random() * shapesPerRequest);
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