var Entity = {};

Entity.REGISTERY = {};
// Entity "factory"
Entity.getBoard = function(name, length, x, y, pixelsPerMeter, color) {
	if (!(name in Entity.REGISTERY)) {
		return new Entity.BaseBoard(length, x, y, pixelsPerMeter, color);
	}

	else {
		return new Entity.REGISTERY[name](length, x, y, pixelsPerMeter, color);
	}
}

Entity.SHAPES = {
	CRUISER_DECK: [
		{x: -.5, y: -.07}, 
		{x: -.35, y: -.07},
		{x: -.25, y: -.15},
		{x: .25, y: -.15},
		{x: .35, y: -.07},
		{x: .5, y: -.07},
		{x: .5, y: .07}, 
		{x: .35, y: .07},
		{x: .25, y: .15},
		{x: -.25, y: .15},
		{x: -.35, y: .07},
		{x: -.5, y: .07}
	],

	WHEEL: [
		{x: -.05, y:-.04},
		{x: .05, y:-.04},
		{x: .05, y:.04},
		{x: -.05, y:.04}
	]
};

Entity.translate = function(points, x, y) {
	var result = [];

	for (var i = 0; i < points.length; i++) {
		var point = {};

		point.x = points[i].x + x;
		point.y = points[i].y + y;

		result.push(point);
	}

	return result;
}

// Base board class
Entity.BaseBoard = function(length, x, y, pixelsPerMeter, color) {
	this.x = x;
	this.y = y;

	this.length = length;
	this.pixelsPerMeter = pixelsPerMeter;
	this.color = color;

	this.transformPoints = function(arr) {
		// Must duplicate
		var result = [];

		for (var i = 0; i < arr.length; i++) {
			var point = {};
			point.x = this.pixelsPerMeter * (this.x + arr[i].x * this.length);
			point.y = this.pixelsPerMeter * (this.y + arr[i].y);
			result.push(point);
		}

		// Just in case
		return result;
	};

	this.renderShape = function(ctx, points) {
		points = this.transformPoints(points);

		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);

		for (var i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}

		ctx.closePath();
	};

	this.render = function(ctx) {
		var deck = Entity.SHAPES.CRUISER_DECK;
		ctx.fillStyle = "#825201";
		
		this.renderShape(ctx, deck);
		ctx.fill();

		ctx.fillStyle = this.color;

		var wheel = Entity.translate(Entity.SHAPES.WHEEL, -.43, .11);
		this.renderShape(ctx, wheel);
		ctx.fill();

		var wheel = Entity.translate(Entity.SHAPES.WHEEL, .43, .11);
		this.renderShape(ctx, wheel);
		ctx.fill();

		var wheel = Entity.translate(Entity.SHAPES.WHEEL, -.43, -.11);
		this.renderShape(ctx, wheel);
		ctx.fill();

		var wheel = Entity.translate(Entity.SHAPES.WHEEL, .43, -.11);
		this.renderShape(ctx, wheel);
		ctx.fill();
	};
}