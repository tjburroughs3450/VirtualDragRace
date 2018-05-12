var Entity = {};

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

	RAPTOR_DECK: [
		{x: -.37, y: -.12}, 
		{x: -.34, y: -.12},
		{x: -.31, y: -.15},
		{x: .31, y: -.15},
		{x: .34, y: -.12},
		{x: .37, y: -.12},
		{x: .37, y: .12}, 
		{x: .34, y: .12},
		{x: .31, y: .15},
		{x: -.31, y: .15},
		{x: -.34, y: .12},
		{x: -.37, y: .12}
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
Entity.BaseBoard = function(name, length, x, y, pixelsPerMeter, color) {
	this.name = name;
	this.x = x;
	this.y = y;

	this.length = length;
	this.pixelsPerMeter = pixelsPerMeter;
	this.color = color;

	this.scale = function(value) {
		return value * this.length * this.pixelsPerMeter;
	}

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
		ctx.strokeStyle = "#FFFFFF";
		
		this.renderShape(ctx, deck);
		ctx.fill();
		//ctx.stroke();

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

Entity.Raptor = function(name, length, x, y, pixelsPerMeter, color) {
	Entity.BaseBoard.call(this, name, length, x, y, pixelsPerMeter, color);

	this.render = function(ctx) {
		ctx.fillStyle = "#000000";

		var wheel = Entity.translate(Entity.SHAPES.WHEEL, -.38, .12);
		this.renderShape(ctx, wheel);
		ctx.fill();

		var wheel = Entity.translate(Entity.SHAPES.WHEEL, .40, .12);
		this.renderShape(ctx, wheel);
		ctx.fill();

		var wheel = Entity.translate(Entity.SHAPES.WHEEL, -.38, -.12);
		this.renderShape(ctx, wheel);
		ctx.fill();

		var wheel = Entity.translate(Entity.SHAPES.WHEEL, .40, -.12);
		this.renderShape(ctx, wheel);
		ctx.fill();

		ctx.fillStyle = "#825201";

		deck = Entity.translate(Entity.SHAPES.RAPTOR_DECK, .03, 0);
		this.renderShape(ctx, deck);
		ctx.fill();

		center = this.transformPoints([{x: .38, y: 0}])[0];

		ctx.beginPath();
		ctx.arc(center.x, center.y, this.scale(.12), -Math.PI / 2, Math.PI / 2);
		ctx.fill();

		back = this.transformPoints([{x: -.5, y: -.12}])[0];
		ctx.fillRect(back.x, back.y, this.scale(.2), this.scale(.24));
	}
}

Entity.REGISTERY = {
	"raptor": Entity.Raptor
};

// Entity "factory"
Entity.getBoard = function(name, length, x, y, pixelsPerMeter, color) {
	if (!(name in Entity.REGISTERY)) {
		return new Entity.BaseBoard(name, length, x, y, pixelsPerMeter, color);
	}

	else {
		return new Entity.REGISTERY[name](name, length, x, y, pixelsPerMeter, color);
	}
}