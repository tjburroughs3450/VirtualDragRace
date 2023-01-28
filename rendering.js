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
	this.canvas.height = boardData.length * (SETTINGS.RACE_LANE_METERS * this.pixels_per_meter + SETTINGS.PIXELS_PER_TEXT_LINE);
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

		this.samples[board.name] = {speeds: speeds, timeDeltas: timeDeltas, maxSpeedIndex: maxSpeedIndex, index: 0};
	}

	// State counter
	this.counter = 0;

	// Loop logic
	this.renderLoop = function() {
		var start = Date.now();

		this.render();

		if (this.update()) {
			this.counter += 1;
		}

		finish = Date.now();

		if (finish - start > this.period)
			console.log("Running slow");

		setTimeout(this.renderLoop.bind(this), this.period - (finish - start));
	};

	// Render logic
	this.render = function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.font = SETTINGS.TEXT_FONT_SIZE + "px " + SETTINGS.TEXT_FONT;

		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].render(this.ctx);

			// Draw speedo
			var velocity_data = this.samples[this.entities[i].name];

			var velocity = velocity_data.index > 0 ? velocity_data.speeds[velocity_data.index] : 0;

			this.ctx.fillStyle = this.entities[i].color;
			this.ctx.fillText(Math.round(10 * velocity * 2.23694) / 10 + " MPH", SETTINGS.TEXT_X_MARGIN, this.entities.length 
				* SETTINGS.RACE_LANE_METERS * this.pixels_per_meter + i * SETTINGS.PIXELS_PER_TEXT_LINE + SETTINGS.TEXT_FONT_SIZE / 2);
		}
	};

	// Update logic
	this.update = function() {
		if (!this.running) {
			return false;
		}

		for (var i = 0; i < this.entities.length; i++) {
			var entity = this.entities[i];
			var velocity_data = this.samples[entity.name];
			var index = velocity_data.index;
			var delta = 1.0 * (index < velocity_data.maxSpeedIndex ? velocity_data.timeDeltas[index] : this.period / 1000.0) * velocity_data.speeds[index];

			var adjustedNosePosition = entity.x + entity.length / 2 + delta;

			if (adjustedNosePosition > this.raceLength) {
				entity.x = this.raceLength - entity.length / 2;
			}

			else {
				entity.x += delta;

				if (index < velocity_data.maxSpeedIndex) {
					velocity_data.index += 1;
				}
			}
		}

		return true;
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