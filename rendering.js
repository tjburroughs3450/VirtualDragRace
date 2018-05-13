var Rendering = {};

Rendering.RaceWindow = function(boardData, frequency, raceLength, width) {
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
	this.period = 1000.0 / frequency;

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
			board.color,
			board.model
		));
	}

	// Create a property map for each board
	this.samples = [];

	for (var i = 0; i < boardData.length; i++) {
		var board = boardData[i];
		var maxSpeed = 0;
		var maxSpeedIndex = 0;

		var speeds = [];
		var timeDeltas = [];

		for (var j = 1; j < board.samples.length; j++) {
			var speed = (board.samples[j].y + board.samples[j - 1].y) / 2.0;
			var timeDelta = board.samples[j].x - board.samples[j - 1].x;

			speeds.push(speed);
			timeDeltas.push(timeDelta);

			if (speed > maxSpeed) {
				maxSpeed = speed;
				maxSpeedIndex = j;
			}
		}

		this.samples[board.name] = {speeds: speeds, timeDeltas: timeDeltas, maxSpeed: maxSpeed, maxSpeedIndex: maxSpeedIndex};
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

			var delta = 0;

			if (this.counter >= velocity_data.maxSpeedIndex) {
				delta = 1.0 * this.period * velocity_data.maxSpeed / 1000;
			}

			else {
				delta = 1.0 * velocity_data.timeDeltas[this.counter] * velocity_data.speeds[this.counter];
			}

			var adjustedNosePosition = entity.x + entity.length / 2 + delta;

			if (adjustedNosePosition > this.raceLength) {
				entity.x = this.raceLength - entity.length / 2;
			}

			else {
				entity.x += delta;
			}
		}

		this.counter += 1;
	};

	this.start = function() {
		this.running = true;
	};

	this.stop = function() {
		this.running = false;
	};

	// Start drawing
	this.renderLoop();
};