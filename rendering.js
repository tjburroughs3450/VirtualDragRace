// Start your motors...
window.onload = function() {
	var raceWindow = new RaceWindow([{samples: [{x: 1, y:1}, {x:2, y:2}]}], 100, 500);
	raceWindow.start();
}

// Augments existing board array with data needed for new contender
function addBoardDataToRace(data, boardName, boardColor, boardLength, velocityData, boardModel) {
	data.push({
		name: boardName,
		color: boardColor,
		samples: velocityData,
		model: boardModel
	});

	// Just to be safe...
	return data;
}

function RaceWindow(boardData, raceLength, width) {
	// Create the canvas
	var canvas = document.createElement("canvas");
	canvas.setAttribute("style", "background-color:#424242; padding-left: 0; padding-right: 0; margin-left: auto; margin-right: auto; display: block;")
	this.ctx = canvas.getContext("2d");
	canvas.width = width;
	canvas.height = 500;
	document.body.appendChild(canvas);

	// Render period
	this.period = 1000.0 * (boardData[0].samples[1].x - boardData[0].samples[0].x);

	// Run flag
	this.running = false;

	// Scale
	this.pixels_per_meter = 1.0 * width / raceLength;

	// Drawable entity buffer
	this.entities = [Entity.getBoard("Test", 1, 1, 2, 100, "#db3c20")];

	// Loop logic
	this.renderLoop = function() {
		var start = Date.now();

		this.update();
		this.render();

		finish = Date.now();

		if (finish - start > this.period)
			console.log("Running slow");

		if (this.running) {
			setTimeout(this.renderLoop.bind(this), this.period - (finish - start));
		}
	};

	// Render logic
	this.render = function() {
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].render(this.ctx);
		}
	};

	// Update logic
	this.update = function() {
		console.log("Test");
	};

	this.start = function() {
		this.running = true;
		this.renderLoop();
	};

	this.stop = function() {
		this.running = false;
	};
}