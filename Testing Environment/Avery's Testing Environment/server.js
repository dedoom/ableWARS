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
    path = require('path'),
	bodyParser = require("body-parser"),
    sql = require('mssql');
	
//database specific info
var config = {
        server: 'localhost',
        database: 'AbleWars',
        user: 'able',
        password: '5hXmvneh',
        port: 1433
    };

var clientCount = 0;
var numOfClientsQueued = 0;
var player1Socket;
var player2Socket;
var player3Socket;
var matches = [];
var numOfMatches = 0;
var player1ID;
var player2ID;
var player3ID;
var shapesPerRequest = 5;

app.use(express.static(path.join(__dirname + '/')));
app.use(bodyParser.json({extend:true}))

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

server.listen(4000, function () {
    console.log("listening on port 4000");
});

io.on('connection', function (socket) {
	console.log("client connected");
    if (numOfClientsQueued == 0) {
        numOfClientsQueued++;
        player1Socket = socket;
		player1ID = Date.now();
		socket.emit('playerNum', 1);
		socket.emit('teamNum', 1);
    }
	else if (numOfClientsQueued == 1) {
        numOfClientsQueued++;
        player2Socket = socket;
		player2ID = Date.now();
		socket.emit('playerNum', 2);
		socket.emit('teamNum', 2);
	}
	else if (numOfClientsQueued == 2) {
        numOfClientsQueued++;
        player3Socket = socket;
		player3ID = Date.now();
		socket.emit('playerNum', 3);
		socket.emit('teamNum', 1);
	}
    else {
		var player4ID = Date.now();
		socket.emit('playerNum', 4);
		socket.emit('teamNum', 2);
        var match = {
			matchID: "match:" + Date.now(),
			team1: {
				player1: { playerID: player1ID, socket: player1Socket, targetTimestamp: 0 }, 
				player2: { playerID: player3ID, socket: player3Socket, targetTimestamp: 0 },
				score: -1000},
			team2: {
				player1: {playerID: player2ID, socket: player2Socket, targetTimestamp: 0 },
				player2: {playerID: player4ID, socket: socket, targetTimestamp: 0 },
				score: -1000},
			gameOver: false};
		matches.push(match);
        numOfMatches++;
		console.log(matches[numOfMatches - 1]['team1']['player1']['playerID']);

        var shapes = getShapes();
		var targetLives = getTargetLives();
		player1Socket.emit('newTargetShapeLives', targetLives);
		player2Socket.emit('newTargetShapeLives', targetLives);
		player3Socket.emit('newTargetShapeLives', targetLives);
        socket.emit('newTargetShapeLives', targetLives);
		
		var startTime = Date.now() + 4000;
        player1Socket.emit('startGame', { matchID: match['matchID'], shapes: shapes, playerID: player1ID, startTime: startTime });
		player2Socket.emit('startGame', { matchID: match['matchID'], shapes: shapes, playerID: player2ID, startTime: startTime });
		player3Socket.emit('startGame', { matchID: match['matchID'], shapes: shapes, playerID: player3ID, startTime: startTime });
		socket.emit('startGame', { matchID: match['matchID'], shapes: shapes, playerID: player4ID, startTime: startTime });
		
		numOfClientsQueued = 0;
		player1Socket = null;
		player2Socket = null;
		player3Socket = null;
    }
	
	socket.on('disconnect', function(){
		if (socket == player1Socket){
			console.log("player1 socket client disconnected");
			player1Socket = null;
			if (player2Socket != null){
				console.log("player 2 pushed to player 1");
				player1Socket = player2Socket;
				player2Socket = null;
				player1Socket.emit('playerNum', 1);
				socket.emit('teamNum', 1);
			}
			if (player3Socket != null){
				console.log("player 3 pushed to player 2");
				player2Socket = player3Socket;
				player3Socket = null;
				player2Socket.emit('playerNum', 2);
				socket.emit('teamNum', 2);
			}
			numOfClientsQueued--;
		}
		else if (socket == player2Socket){
			console.log("player2 socket client disconnected");
			player2Socket = null;
			if (player3Socket != null){
				console.log("player 3 pushed to player 2");
				player2Socket = player3Socket;
				player3Socket = null;
				player2Socket.emit('playerNum', 2);
				socket.emit('teamNum', 2);
			}
			numOfClientsQueued--;
		}
		else if (socket == player3Socket){
			console.log("player3 socket client disconnected");
			player3Socket = null;
			numOfClientsQueued--;
		}
		else {
			for (var m = 0; m < matches.length; m++){
				if (matches[m]['team1']['player1']['socket'] == socket){
					console.log("player1 socket client disconnected");
					matches[m]['team2']['player1']['socket'].emit('winByDisconnect');
					matches[m]['team2']['player2']['socket'].emit('winByDisconnect');
					matches[m]['team1']['player2']['socket'].emit('loseByTeamDisconnect');
					matches.splice(m, 1);
					numOfMatches--;
				}
				else if (matches[m]['team1']['player2']['socket'] == socket){
					console.log("player3 socket client disconnected");
					matches[m]['team2']['player1']['socket'].emit('winByDisconnect');
					matches[m]['team2']['player2']['socket'].emit('winByDisconnect');
					matches[m]['team1']['player1']['socket'].emit('loseByTeamDisconnect');
					matches.splice(m, 1);
					numOfMatches--;
				}
				else if (matches[m]['team2']['player1']['socket'] == socket){
					console.log("player2 socket client disconnected");
					matches[m]['team1']['player1']['socket'].emit('winByDisconnect');
					matches[m]['team1']['player2']['socket'].emit('winByDisconnect');
					matches[m]['team2']['player1']['socket'].emit('loseByTeamDisconnect');
					matches.splice(m, 1);
					numOfMatches--;
				}
				else if (matches[m]['team2']['player2']['socket'] == socket){
					console.log("player4 socket client disconnected");
					matches[m]['team1']['player1']['socket'].emit('winByDisconnect');
					matches[m]['team1']['player2']['socket'].emit('winByDisconnect');
					matches[m]['team2']['player2']['socket'].emit('loseByTeamDisconnect');
					matches.splice(m, 1);
					numOfMatches--;
				}
			}
			ensureSplice(162);
		}
	});

    socket.on('targetShapeClick', function (data) {
		//console.log(data['matchID']);
        var match = getMatchByID(data['matchID']);
		if (match == null){
			return;
		}
        var team = 0, opponentTeam = 0;
        if (match['team1']['player1']['socket'] == socket || match['team1']['player2']['socket'] == socket){
            team = 1;
            opponentTeam = 2;
        }
        else {
            team = 2;
            opponentTeam = 1;
        }
        match['team' + team]['player1']['socket'].emit('point');
		match['team' + team]['player2']['socket'].emit('point');
        match['team' + opponentTeam]['player1']['socket'].emit('losePoint'/*, data['shapeID']*/); //check method
		match['team' + opponentTeam]['player2']['socket'].emit('losePoint'/*, data['shapeID']*/); // check method
        var shapes = getShapes();
		var targetLives = getTargetLives();
        match['team' + team]['player1']['socket'].emit('newShapes', shapes);
		match['team' + team]['player1']['socket'].emit('newTargetShapeLives', targetLives);
		match['team' + team]['player2']['socket'].emit('newShapes', shapes);
		match['team' + team]['player2']['socket'].emit('newTargetShapeLives', targetLives);
        match['team' + opponentTeam]['player1']['socket'].emit('newShapes', shapes);
		match['team' + opponentTeam]['player1']['socket'].emit('newTargetShapeLives', targetLives);
		match['team' + opponentTeam]['player2']['socket'].emit('newShapes', shapes);
		match['team' + opponentTeam]['player2']['socket'].emit('newTargetShapeLives', targetLives);
    });
	
	/*socket.on('shapesRequest', function(data){
		needNewShapes--;
		newShapes = getShapes();
		var match = getMatchByID(data['matchID']);
		
        var targetLives = getTargetLives();
        match['team1']['player1']['socket'].emit('newShapes', newShapes);
		match['team1']['player1']['socket'].emit('newTargetShapeLives', targetLives);
		match['team1']['player2']['socket'].emit('newShapes', newShapes);
		match['team1']['player2']['socket'].emit('newTargetShapeLives', targetLives);
		match['team2']['player1']['socket'].emit('newShapes', newShapes);
		match['team2']['player1']['socket'].emit('newTargetShapeLives', targetLives);
		match['team2']['player2']['socket'].emit('newShapes', newShapes);
		match['team2']['player2']['socket'].emit('newTargetShapeLives', targetLives);
	});*/

	socket.on('shapeClick', function (data) {
		//console.log(data['matchID']);
        var match = getMatchByID(data['matchID']);
        var team = 0, opponentTeam = 0;
        if (match['team1']['player1']['socket'] == socket || match['team1']['player2']['socket'] == socket){
            team = 1;
            opponentTeam = 2;
        }
        else {
            team = 2;
            opponentTeam = 1;
        }
		//console.log("player: " + player + "  opponent: " + opponent);
        match['team' + team]['player1']['socket'].emit('point');
		match['team' + team]['player2']['socket'].emit('point');
        match['team' + opponentTeam]['player1']['socket'].emit('losePoint'/*, data['shapeID']*/);
		match['team' + opponentTeam]['player2']['socket'].emit('losePoint'/*, data['shapeID']*/);
    });
	
	socket.on('timeUp', function(data){
		var matchIndex = getIndexOfMatchByID(data['matchID']);
		var match = getMatchByID(data['matchID']);
		console.log("player " + data['playerNum'] + " emit tie");
		if (match == null){
			console.log("time up called on null match by player " + data['playerNum']);
			return;
		}
		if (data['playerNum'] == 3 || data['playerNum'] == 4){
			console.log("time up called by player " + data['playerNum']);
			return;
		}
		match['gameOver'] = true;
		var score = data['score'];
		//console.log("matchIndex = " + matchIndex + "\nhigherScore = " + parseInt(matches[matchIndex]['higherScore']) + "\nscore = " + score);
		var team = 0, opponentTeam = 0, player = 0;
			if (match['team1']['player1']['socket'] == socket || match['team1']['player2']['socket'] == socket) {
				team = 1;
				opponentTeam = 2;
			}
			else {
				team = 2;
				opponentTeam = 1;
			}
		matches[matchIndex]['team' + team]['score'] = score;
		if (matches[matchIndex]['team1']['score'] > -999 && matches[matchIndex]['team2']['score'] > -999) {
			if (matches[matchIndex]['team1']['score'] > matches[matchIndex]['team2']['score']){
				console.log("team1: " + matches[matchIndex]['team1']['score'] + ", team2: " + matches[matchIndex]['team2']['score']);
				match['team2']['player1']['socket'].emit('lose');
				match['team2']['player2']['socket'].emit('lose');
				match['team1']['player1']['socket'].emit('win');
				match['team1']['player2']['socket'].emit('win');
				matches.splice(getIndexOfMatchByID(data['matchID']), 1);
				numOfMatches--;
				ensureSplice(256);
			}
			else if (matches[matchIndex]['team1']['score'] < matches[matchIndex]['team2']['score']){
				match['team2']['player1']['socket'].emit('win');
				match['team2']['player2']['socket'].emit('win');
				match['team1']['player1']['socket'].emit('lose');
				match['team1']['player2']['socket'].emit('lose');
				matches.splice(getIndexOfMatchByID(data['matchID']), 1);
				numOfMatches--;
				ensureSplice(265);
			}
			else {
				match['team1']['player1']['socket'].emit('tie');
				match['team1']['player2']['socket'].emit('tie');
				match['team2']['player1']['socket'].emit('tie');
				match['team2']['player2']['socket'].emit('tie');
				matches.splice(getIndexOfMatchByID(data['matchID']), 1);
				numOfMatches--;
				ensureSplice(274);
			}
		}
	});
	
    socket.on('win', function (data) {
        var team = 0, opponentTeam = 0;
		var match = getMatchByID(data['matchID']);
		if (match == null){
			console.log("time up called on null match by player " + data['playerNum']);
			return;
		}
		if (data['playerNum'] == 3 || data['playerNum'] == 4){
			console.log("time up called by player " + data['playerNum']);
			return;
		}
		match['gameOver'] = true;
        if (match['team1']['player1']['socket'] == socket || match['team1']['player2']['socket'] == socket) {
            team = 1;
			opponentTeam = 2;
        }
        else {
			team = 2;
            opponentTeam = 1;
        }
        match['team' + team]['player1']['socket'].emit('win');
		match['team' + team]['player2']['socket'].emit('win');
        match['team' + opponentTeam]['player1']['socket'].emit('lose');
		match['team' + opponentTeam]['player2']['socket'].emit('lose');
		matches.splice(getIndexOfMatchByID(data['matchID']), 1);
		numOfMatches--;
		ensureSplice(296);
    });
});

function ensureSplice(line){
	for (var m = 0; m < matches.length; m++){
		if (matches[m]['team1']['player1']['socket'] == socket || matches[m]['team1']['player2']['socket'] == socket || matches[m]['team2']['player1']['socket'] == socket || matches[m]['team2']['player2']['socket'] == socket){
			console.log("match found after splice");
			return;
		}
	}
	console.log("splice at line " + line + ": NO match found after splice");
}

function getTargetLives(){
	targetLives = 1;
	var hasMultilives = Math.floor(Math.random() * 10);
	if (hasMultilives > 7){
		targetLives = Math.floor(Math.random() * 5) + 1;;
	}
	return targetLives;
}

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

//use for non-duplicatable target shapes
function getShapes() {
    var shapeCount = 1 + Math.round(Math.random() * shapesPerRequest);
	//var shapeCount = 1;
    var shapes = [];
	var targetPicker = -1;
    for (var i = 0; i < shapeCount; i++) {
        shapes.push(getNewShape(i, targetPicker));
		if (i == 0){
			targetPicker = shapes[0]['picker'];
		}
    }

    return shapes;
}

function getNewShape(i, targetPicker) {
    var id = i;
    var picker = targetPicker;
	while (picker == targetPicker){
		picker = Math.floor((Math.random() * 12));
	}
    var height = 40 + Math.floor((Math.random() * 110));

    return { id: id, picker: picker, height: height};
}

//use for duplicatable target shapes
/*function getShapes() {
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
    var height = 40 + Math.floor((Math.random() * 110));

    return { id: id, picker: picker, height: height};
}*/

// *************************************************************************************** //
// ************************************ LOGIN PORTION ************************************ //

app.post('/signIn', function(req, res, next) {
    //console.log(req.body.password);
    var user = req.body.username;
    var pass = req.body.password;
    //200 : success / 400 : invalid credentials / 410 : username exists (primary key violation)
    var response = "";
    
    var dbConn = new sql.Connection(config);
    
    dbConn.connect().then(function () {
        console.log("db connection openned");
        var request = new sql.Request(dbConn);
        //For testing display//
//        request.query("select * from account").then(function (recordSet) {
//            console.log(recordSet);
        
        //Validate credentials//
        
//        request.query("SELECT * FROM account WHERE username='" + user + "'").then(function (recordSet) {
//            if (recordSet.length == 0) {
//                response = "410";
//                console.log(response);
//                res.end(response);
//            }
//        });
        
        request.query("SELECT * FROM account WHERE username='" + user + "' AND password='" + pass + "'").then(function (recordSet) {
            if(recordSet.length > 0) {
                //console.log(recordSet);
                response = "200";
                console.log(response);
                res.end(response);
            }else {
                //console.log("No user info found");
                response = "400";
                console.log(response);
                res.end(response);
            }
        });
            console.log("db connection closed")
            dbConn.close();
        }).catch(function (err) {
        console.log("Connection Failed");
        console.log(err);
        });
    });

//app.get('/test/:id', function(req, res, next) {
//    console.log(req.params.id);
//});

// *************************************************************************************** //
// ******************************** REGISTRATION PORTION ******************************** //
app.post('/signUp', function(req, res, next) {
    var fname = req.body.firstName;
    var lname = req.body.lastName;
    var uname = req.body.username;
    var pass = req.body.password;
    var teamid = null;
    var response = "";
    
    var dbConn = new sql.Connection(config);

    dbConn.connect().then(function() {
		console.log("db connection openned");
        var transaction = new sql.Transaction(dbConn);
        transaction.begin().then(function() {
            var request = new sql.Request(dbConn);
            console.log("Transaction");
            request.query("INSERT INTO account (username,fName,lName,password,teamid) VALUES ('" + uname + "','" + fname + "','" + lname + "','" + pass + "'," + teamid + ")")
            .then(function() {
                transaction.commit().then(function(recordset) {
                    console.log("Affected Rows: " + request.rowsAffected);
					dbConn.close();
					response = "200";
					console.log(response);
					res.end(response);
                }).catch(function (err) {
                    console.log("Error in Transaction Commit " + err);
                    dbConn.close();
					response = "410";
					console.log(response);
					res.end(response);
            });
        }).catch(function (err) {
                console.log("Error in Transaction Begin " + err);
                dbConn.close();
				response = "410";
				console.log(response);
				res.end(response);
            })
        }).catch(function (err) {
            console.log(err);
            dbConn.close();
			response = "410";
			console.log(response);
			res.end(response);
        });

    }).catch(function (err) {
        console.log(err);
		dbConn.close();
		response = "410";
		console.log(response);
		res.end(response);
    });
});

app.post('/createStatsRecord', function(req, res, next) {
	var uname = req.body.username;
    var response = "";
    
    var dbConn = new sql.Connection(config);
	
	dbConn.connect().then(function() {
		console.log("db connection openned");
        var transaction = new sql.Transaction(dbConn);
        transaction.begin().then(function() {
            var request = new sql.Request(dbConn);
            console.log("Transaction");
            request.query("INSERT INTO [dbo].[Statistics] (username,wins,losses,fastestWin,highestScore,gamesPlayed) VALUES ('" + uname + "','0','0','0','0','0')")
            .then(function() {
                transaction.commit().then(function(recordset) {
                    console.log("Affected Rows: " + request.rowsAffected);
                    dbConn.close();
					response = "200";
					console.log(response);
					res.end(response);
                }).catch(function (err) {
                    console.log("Error in Transaction Commit " + err);
                    dbConn.close();
					dbConn.close();
					response = "410";
					console.log(response);
					res.end(response);
            });
        }).catch(function (err) {
                console.log("Error in Transaction Begin " + err);
                dbConn.close();
				dbConn.close();
				response = "410";
				console.log(response);
				res.end(response);
            })
        }).catch(function (err) {
            console.log(err);
            dbConn.close();
			dbConn.close();
			response = "410";
			console.log(response);
			res.end(response);
        });

    }).catch(function (err) {
        console.log(err);
		dbConn.close();
		response = "410";
		console.log(response);
		res.end(response);
    });
});

app.post('/usernameValidation', function(req, res, next) {
	if (req == null){
		console.log("req null");
	}
	if (req.body == null){
		console.log("req null");
	}
    var uname = req.body.username;
    var response = "";
    
    var dbConnV = new sql.Connection(config);
    
    dbConnV.connect().then(function() {
        console.log("dbv connection openned");
        
        var requestV = new sql.Request(dbConnV);
        // verify username uniqueness
        requestV.query("SELECT * FROM account WHERE username='" + uname + "'").then(function (recordSetV) {
            if (recordSetV.length != 0) {
                response = "200";
                console.log(response);
                res.end(response);
				dbConnV.close();
            } else {
                response = "410";
                console.log(response);
                res.end(response);
				dbConnV.close();
            }
        });
    }).catch(function (err) {
        console.log(err);
		response = "410";
        console.log(response);
        res.end(response);
		dbConnV.close();
    });
});

app.post('/getStats', function(req, res, next) {
	if (req == null){
		console.log("req null");
	}
	if (req.body == null){
		console.log("req null");
	}
    var uname = req.body.username;
	var response = "";
    
    var dbConnV = new sql.Connection(config);
    
    dbConnV.connect().then(function() {
        console.log("dbv connection opened: retrieving stats");
        
        var requestV = new sql.Request(dbConnV);
        requestV.query("SELECT * FROM [dbo].[Statistics] WHERE username='" + uname + "'").then(function (recordSetV) {
            if (recordSetV.length != 0) {
				dbConnV.close();
				response = "200";
				console.log(response);
				console.log(recordSetV.length);
                console.log("recordSetV" + recordSetV[0]['accountStatistics']);
                res.end(JSON.stringify(recordSetV[0]));
            } else {
				dbConnV.close();
                response = "410";
                console.log(response);
                res.end(response);
            }
        }).catch(function (err) {
			dbConnV.close();
			response = "410";
			console.log(response);
			console.log(err);
			res.end(response);
		})
    }).catch(function (err) {
		dbConnV.close();
		response = "410";
		console.log(response);
		console.log(err);
        res.end(response);
    });
});

app.post('updateStats', function(req, res, next) {
    var uname = req.body.username;
	var gamesPlayed = parseInt(req.body.gamesPlayed);
	var wins = parseInt(req.body.wins);
	var losses = parseInt(req.body.losses);
	var fastestWin = parseInt(req.body.fastestWin);
	var highScore = parseInt(req.body.highScore);
	response = "";
    
    var dbConn = new sql.Connection(config);
    
    dbConn.connect().then(function(){
        var transactionStats = new sql.Transaction(dbConn);
        
        transactionStats.begin().then(function() {
            var request = new sql.Request(dbConn);
            console.log("Transaction update Stats");
            request.query("UPDATE Statistics SET gamesPlayed=" + gamesPlayed + ", wins=" + wins + ", losses=" + losses + ", fastestWin=" + fastestWin + ", highScore=" + highScore + " WHERE username='" + uname + "'");
			.then(function() {
				transactionStates.commit().then(function(recordset) {
					response = "200";
					console.log(response);
					console.log("Affected Rows: " + request.rowsAffected);
					dbConn.close();
					res.end(response);
				}).catch(function (err) {
					response = "410";
					console.log(response);
					console.log("Error in Transaction Commit " + err);
					dbConn.close();
					res.end(response);
				});
				}).catch(function (err) {
					response = "410";
					console.log(response);
					console.log("Error in Transaction Begin " + err);
					dbConn.close();
					res.end(response);
				});
		}
		}).catch(function (err) {
			response = "410";
			console.log(response);
			console.log(err);
			dbConn.close();
			res.end(response);
		});
    }).catch(function (err) {
        response = "410";
		console.log(response);
		console.log(err);
		bdConn.close();
		res.end(response);
    });
});