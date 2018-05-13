var DataProcessing = {}

// Takes time and data arrays (e.g. time and velocity arrays) and a desired framerate (e.g. 30 FPS)
// and returns an array used to sample data out at the correct rate. The returned array will
// be of the same length as the data/time arrays and will contain zeros where data can be discarded
// and ones on critical samples, e.g. [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0] to downsample by 4x.
DataProcessing.getSamplingArray = function(timeArray, dataArray, desiredRate)
{
    console.assert(timeArray.length == dataArray.length, "Array lengths must be same");
    console.assert(timeArray.length >= 2, "Arrays must contain at least two samples");

    var desiredPeriod = 1.0 / desiredRate;
    var actualPeriod = timeArray[1] - timeArray[0];     // Data must be given w/ constant period

    console.assert(actualPeriod <= desiredPeriod, "Desired period must be less than actual (can't upsample)");
    
    var samplingPeriod = desiredPeriod / actualPeriod;

    // Create the sampling array
    samplingArray = [];
    for (var i = 0; i < dataArray.length; ++i)
    {
        var sampleProximity = i % samplingPeriod;
        if (sampleProximity <= 0.5 || (samplingPeriod - sampleProximity) < 0.5)
            samplingArray[i] = 1;
        else
            samplingArray[i] = 0;
    }

    return samplingArray;
};

// Creates a new array containing the samples at locations marked in the sampling array
// (see getSamplingArray description).
DataProcessing.resampleArray = function(dataArray, samplingArray)
{
    console.assert(dataArray.length == samplingArray.length, "Array lengths must match");
    
    var resampledArray = [];
    var resampledIndex = 0;
    for (var i = 0; i < samplingArray.length; ++i)
    {
        if (samplingArray[i] == 1)
            resampledArray[resampledIndex++] = dataArray[i];
    }

    return resampledArray;
};

DataProcessing.mphToMs = function(dataArray) {
    for (var i = 0; i < dataArray.length; i++) {
        dataArray[i] *= 0.44704;
    }
};