var DataLoader = {};

DataLoader.data = [];

DataLoader.parseIntoArrays = function(input) {
    input = input.split("&");

    var time = input[0].split(',');
    var data = input[1].split(',');

    console.assert(time.length == data.length, "X and Y must be equal in length");

    for (var i = 0; i < time.length; i++) {
        if (parseFloat(data[i]) < 0)
            break;

        time[i] = parseFloat(time[i]);
        data[i] = parseFloat(data[i]);
    }

    return [time, data];
};

DataLoader.load = function(name, color, length, type, data, category, model) {
    if (type != "speed" || category != "visible") {
        return;
    }
    
    var timeDataArrays = this.parseIntoArrays(data);
    var time = timeDataArrays[0];
    var data = timeDataArrays[1];

    var samplingArray = DataProcessing.getSamplingArray(time, data, SETTINGS.RENDER_FPS);
    var timeResample = DataProcessing.resampleArray(time, samplingArray);
    var dataResample = DataProcessing.resampleArray(data, samplingArray);

    DataProcessing.mphToMs(dataResample);

    console.assert(timeResample.length == dataResample.length, "Array lengths somehow aren't the same...");

    points = [];

    for (var i = 0; i < timeResample.length; i++) {
        points.push({
            x: timeResample[i],
            y: dataResample[i]
        });
    }

    DataLoader.data[name] = {
		name: name,
		color: color,
		length: parseFloat(length) * 0.0254,
		samples: points,
		model: model
	};
};

DataLoader.create = function(boardNames, raceLength, width) {
    boardData = [];

    for (var i = 0; i < boardNames.length; i++) {
        boardData.push(DataLoader.data[boardNames[i]]);
    }

    return new Rendering.RaceWindow(boardData, raceLength, width);
};