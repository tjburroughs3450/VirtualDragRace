var raceWindow;  // For console

// Start your motors...
window.onload = function() {
	var boardData = [];
	addBoardDataToRace(boardData, "Boosted Board", "#FF0000", 1, [{x: 1, y: 2}, {x: 2, y: 3}], "None");
	addBoardDataToRace(boardData, "raptor", "#000000", 1, [{x: 1, y: 3}, {x: 2, y: 4}], "None");
	raceWindow = new RaceWindow(boardData, 5, 500);
	//raceWindow.start();
}

// Augments existing board array with data needed for new contender
function addBoardDataToRace(data, boardName, boardColor, boardLength, velocityData, boardModel) {
	data.push({
		name: boardName,
		color: boardColor,
		length: boardLength,
		samples: velocityData,
		model: boardModel
	});

	// Just to be safe...
	return data;
}

function RaceWindow(boardData, raceLength, width) {
	// To align the fronts of the decks, max length must be determined
	var maxLength = 0;

	for (var i = 0; i < boardData.length; i++) {
		if (boardData[i].length > maxLength) {
			maxLength = boardData[i].length;
		}
	}

	this.raceLength = raceLength + maxLength;

	// Scale
	this.pixels_per_meter = 1.0 * width / this.raceLength;

	// Create the canvas
	this.canvas = document.createElement("canvas");
	this.canvas.setAttribute("style", "background-color:" + SETTINGS.CANVAS_BACK_COLOR + "; padding-left: 0; padding-right: 0; margin-left: auto; margin-right: auto; display: block;")
	this.ctx = this.canvas.getContext("2d");
	this.canvas.width = width;
	this.canvas.height = boardData.length * SETTINGS.RACE_LANE_METERS * this.pixels_per_meter;
	document.body.appendChild(this.canvas);

	// Render period
	this.period = 1000.0 * (boardData[0].samples[1].x - boardData[0].samples[0].x);

	// Run flag
	this.running = false;

	// Drawable entity buffer
	this.entities = [];

	// Populate buffer
	for (var i = 0; i < boardData.length; i++) {
		var board = boardData[i];
		
		this.entities.push(Entity.getBoard(
			board.name,
			board.length,
			maxLength - board.length / 2,
			(i + .5) * SETTINGS.RACE_LANE_METERS,
			this.pixels_per_meter,
			board.color
		));
	}

	// Create a property map for each board
	this.samples = [];

	for (var i = 0; i < boardData.length; i++) {
		var board = boardData[i];
		var velocity = [];
		var maxSpeed = 0;
		var maxSpeedIndex = 0;

		for (var j = 0; j < board.samples.length; j++) {
			var speed = board.samples[j].y;
			
			velocity.push(speed);

			if (speed > maxSpeed) {
				maxSpeed = speed;
				maxSpeedIndex = j;
			}
		}

		this.samples[board.name] = {velocity: velocity, maxSpeed: maxSpeed, maxSpeedIndex: maxSpeedIndex};
	}

	// State counter
	this.counter = 0;

	// Loop logic
	this.renderLoop = function() {
		var start = Date.now();

		this.update();
		this.render();

		finish = Date.now();

		if (finish - start > this.period)
			console.log("Running slow");

		setTimeout(this.renderLoop.bind(this), this.period - (finish - start));
	};

	// Render logic
	this.render = function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].render(this.ctx);
		}
	};

	// Update logic
	this.update = function() {
		if (!this.running) {
			return;
		}

		for (var i = 0; i < this.entities.length; i++) {
			var entity = this.entities[i];
			var velocity_data = this.samples[entity.name];

			var speed = 0;

			if (this.counter >= velocity_data.maxSpeedIndex) {
				speed = velocity_data.maxSpeed;
			}

			else {
				speed = velocity_data.velocity[this.counter];
			}

			var delta = Math.round(1.0 * speed * this.period / 1000);

			var adjustedNosePosition = entity.x + entity.length / 2 + delta;

			if (adjustedNosePosition > this.raceLength) {
				entity.x = this.raceLength - entity.length / 2;
			}

			else {
				entity.x += delta;
			}

			this.counter += 1;
		}
	};

	this.start = function() {
		this.running = true;
	};

	this.stop = function() {
		this.running = false;
	};

	// Start drawing
	this.renderLoop();
}