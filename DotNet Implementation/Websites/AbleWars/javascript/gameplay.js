var counter;
var interval;
var shapes = ["Triangle_blue.png", "Rectangle_blue.png", "Circle_blue.png", "Triangle_yellow.png", "Rectangle_yellow.png", "Circle_yellow.png", "Triangle_red.png", "Rectangle_red.png", "Circle_red.png", "Triangle_green.png", "Rectangle_green.png", "Circle_green.png"];
var shapeSelect;
var player = 0;
var points = 0;

//start countdown
$(document).ready(function () {
	counter = 3;
	interval = setInterval(function () { startInterval() }, 1000);

	//create an onClick event for each <div> in the playing field to remove itself and increment player
	$("#playingField").on("click", "div", function (event) {
		$(this).remove();
		MovePlayer();
	});
});

//decrement counter until counter == 0, then start game
function startInterval() {
	counter--;
	if (counter != 0) {
		$("#timer").text(counter);
	}
	else {
		$("#timer").text("Go!");
		clearInterval(interval);
		StartGame();
	}
}

//create up to 10 random shapes
function StartGame() {
	var shapeCount = Math.round(Math.random() * 10);
	for (var i = 0; i < shapeCount; i++) {
		DetermineShape(i);

	}
}

//define the size and position of the shape and create it in a <div> <img/> </div> inside of the playingField <div>
function DetermineShape(shapeCount) {
	var picker = Math.floor((Math.random() * 12));

	//alert(picker);
	//alert(shapes[picker])

	$("#playingField").append("<div style='display:block' id = shape" + shapeCount + "><img class='shapeInPlay' src='../img/shapes/" + shapes[picker] + "'></div>");

	//var bodyWidth = document.body.clientWidth
	//var bodyHeight = document.body.clientHeight;

	var randPosX = Math.floor((Math.random() * $("#playingField").width()));
	var randPosY = Math.floor((Math.random() * $("#playingField").height()));

	//var posLog = document.getElementById('shape'+shapeCount);
	//var posXY = 'x: ' + randPosX + '<br />' + 'y: ' + randPosY;

	var shapeWidth = Math.floor((Math.random() * 200));
	var shapeHeight = Math.floor((Math.random() * 200));
	$("#shape" + shapeCount).css("width", shapeWidth);
	$("#shape" + shapeCount).css("height", shapeHeight);
	$("#shape" + shapeCount).children().css("width", shapeWidth);
	$("#shape" + shapeCount).children().css("height", shapeHeight);
	$('#shape' + shapeCount).css('left', randPosX);
	$('#shape' + shapeCount).css('top', randPosY);

	//posLog.innerHTML = posXY

}

//increment player's position and score
function MovePlayer() {
	//var leftVal = $("#player1").css('left').valueOf()
	//var newLeftVal = leftVal - 50+'px';
	//alert(leftVal);
	//alert(newLeftVal);

	var left = parseInt($('#player1').css("left")) - 50;
	$("#player1").css('left', left)

	// $("#player1").after("<div class='edit cancel' style='position:absolute;top:" + top + "px;left:" + left + "px'>Cancel</div>");
}