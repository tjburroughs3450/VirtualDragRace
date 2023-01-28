var METRIC_TYPES = {
    VELOCITY: "speed",
    ACCELERATION: "acceleration"
};

var GRAPH_ASPECT_RATIO = 2;
var GRAPH_MARGIN = 10;

// Chart handle counter
var chartCounter = 0;
var acceleration_graph;

function get_new_canvas(is_custom) {
    var canvas_id = "chart_" + chartCounter++;
    jQuery(is_custom ? "#custom_charts" : "#charts").append("<canvas id=\"" + canvas_id + "\"></canvas><br>");
    return document.getElementById(canvas_id).getContext('2d');
}

var METRIC_FUNCS = {
    ACCELERATION: function(data, params) {
        var timeWhen = function(data, velocity) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].y >= velocity) {
                    return data[i].x;
                }
            }

            return null;
        };

        var start = timeWhen(data, params[0]);
        var end = timeWhen(data, params[1]);

        if (start != null && end != null) {
            return end - start;
        }

        else {
            return null;
        }
    },

    MAX: function(data, params) {
        var max = -10000;

        for (var n in data) {
            if (data[n].y > max) {
                max = data[n].y;
            }
        }

        return max;
    }
};

var DATA_REDUCTION_FACTOR = 10;

function Grapher() {
    var GRAPH_STYLE = {
        XY_POINT_RADIUS: 0,
        LINE_WIDTH: .8
    };

    var parseDataSet = function(input) {
        input = input.split("&");

        var x = input[0].split(',');
        var y = input[1].split(',');

        if (x.length != y.length) {
            console.log("X and Y must be equal in length");
            return null;
        }

        var result = [];

        for (var i = 0; i < x.length; i++) {
            if (parseFloat(y[i]) < 0)
                break;

            result[i] = {
                x: parseFloat(x[i]),
                y: parseFloat(y[i])
            };
        }

        return result;
    };

    var reduceXYData = function(data) {
        var buffers = SignalProcessing.isolate_dimensions(data);
        buffers.x = SignalProcessing.compress_samples(buffers.x, DATA_REDUCTION_FACTOR);
        buffers.y = SignalProcessing.compress_samples(buffers.y, DATA_REDUCTION_FACTOR);

        return SignalProcessing.combine_dimensions(buffers);
    }

    var createXYDataset = function(label, color, data) {
        return {
            label: label,
            xAxisID: 'x',
            yAxisID: 'y',
            pointRadius: GRAPH_STYLE.XY_POINT_RADIUS,
            fill: false,
            borderColor: color,
            borderWidth: GRAPH_STYLE.LINE_WIDTH,
            data: reduceXYData(data)
        };
    };

    var createBarDataset = function(colors, data) {
        return {
            xAxisID: 'x',
            yAxisID: 'y',
            borderColor: "#000000",
            backgroundColor: colors,
            data: data
        };
    };

    this.createDatasetObject = function(metric) {
        var datasets = [];

        for (var board in this.data[metric]) {
            datasets.push(createXYDataset(board, this.data[metric][board].color, this.data[metric][board].data));
        }

        return {
            datasets: datasets
        };
    };

    this.addDataSet = function(chart, board, metric) {
        chart.data.datasets.push(createXYDataset(board, this.data[metric][board].color, this.data[metric][board].data));
        chart.update();
    }

    this.removeDataSet = function(chart, board) {
        for (var i = 0; i < chart.data.datasets.length; i++) {
            if (chart.data.datasets[i].label == board) {
                chart.data.datasets.splice(i, 1);
                chart.update();
                return;
            }
        }
    }

    // REFACTOR!!! // PARAMETERIZE
    this.createXYGraph = function(is_custom, chart_title, x_label, y_label, metric) {
        var ctx = get_new_canvas(is_custom);

        return new Chart(ctx, {
            type: 'line',
            data: {datasets: []},//this.createDatasetObject(metric),
            options: {
                title: {
                    text: chart_title,
                    fontColor: "#FFFFFF",
                    display: true
                },

                legend: {
                    display: true,
                    fullWidth: true,
                    position: "right",
                    labels: {
                        fontColor: "#FFFFFF"
                    }
                },

                scales: {
                    xAxes: [{
                                id: 'x',
                                type: 'linear',
                                gridLines: {
                                    display: true,
                                    color: "#474747",
                                    zeroLineColor: "#FFFFFF"
                                },

                                scaleLabel: {
                                    display: true,
                                    labelString: x_label,
                                    fontColor: "#FFFFFF"
                                },
                                ticks: {
                                    fontColor: "#FFFFFF", // this here
                                },
                            }],
                    yAxes: [{
                                id: 'y',
                                type: 'linear',
                                gridLines: {
                                    display: true,
                                    color: "#474747",
                                    zeroLineColor: "#FFFFFF"
                                },

                                scaleLabel: {
                                    display: true,
                                    labelString: y_label,
                                    fontColor: "#FFFFFF"
                                },
                                ticks: {
                                    fontColor: "#FFFFFF", // this here
                                },
                            }]
                },

                responsive: true
            } 
        });
    };

    // REFACTOR!!! PARAMETERIZE!!!
    this.createBarChart = function(is_custom, chart_title, x_label, metric, func, params, ascending) {
        var extracted = this.extractMetric(metric, func, params, ascending);

        var ctx = get_new_canvas(is_custom);

        return new Chart(ctx, {
            type: 'horizontalBar',
            data: { 
                datasets: [createBarDataset(extracted[1], extracted[2])]
            },
            options: {
                title: {
                    text: chart_title,
                    fontColor: "#FFFFFF",
                    display: true
                },

                legend: {
                    display: false,
                },

                scales: {
                    yAxes: [{
                                id: 'y',
                                type: 'category',
                                labels: extracted[0],

                                ticks: {
                                    fontColor: "#FFFFFF",
                                },
                            }],
                    xAxes: [{
                                id: 'x',
                                type: 'linear',

                                scaleLabel: {
                                    display: true,
                                    labelString: x_label,
                                    fontColor: "#FFFFFF"
                                },
                                ticks: {
                                    fontColor: "#FFFFFF",
                                    beginAtZero: true
                                }
                            }]
                },

                responsive: true
            } 
        });
    };

    this.extractMetric = function(metric, func, params, ascending) {
        var results = [];
        
        for (var board in this.data[metric]) {
            var data = this.data[metric][board].data;

            var result = func(data, params);

            if (result != null) {
                results.push({board: board, color:this.data[metric][board].color, metric:result});
            }
        }

        if (ascending) {
            results.sort(function(a, b) {
                return a.metric - b.metric;
            });
        }

        else {
            results.sort(function(b, a) {
                return a.metric - b.metric;
            });
        }

        var boards = [];
        var colors = [];
        var times = [];

        for (var i in results) {
            boards[i] = results[i].board;
            colors[i] = results[i].color;
            times[i] = results[i].metric;
        }

        return [boards, colors, times];
    };

    this.data = [];

    this.addXYData = function(board, color, type, data) {
        if (!(type in this.data)) {
            this.data[type] = [];
        }

        this.data[type][board] = {data: parseDataSet(data), color: color};
    };
}

var grapher = new Grapher();

function acceleration_click_handler(cb) {
    if (cb.checked) {
        grapher.addDataSet(acceleration_graph, cb.value, METRIC_TYPES.ACCELERATION);
    }

    else {
        grapher.removeDataSet(acceleration_graph, cb.value);
    }
}

// fuck this language
function replace(str, pattern, val) {
    while (str.indexOf(pattern) != -1) {
        str = str.replace(pattern, val)
    }

    return str
}

function showDefaultGraphs() {
    //var width = jQuery(".site-aligner").width() - AMAZON_AD_WIDTH - GRAPH_MARGIN;
    //var height = Math.round(width / GRAPH_ASPECT_RATIO);

    //jQuery("#chart1").attr("width", width);
    //jQuery("#chart1").attr("height", height);

    grapher.createBarChart(false, "5-15 MPH Time", "Time (seconds)", METRIC_TYPES.VELOCITY, METRIC_FUNCS.ACCELERATION, [5.0, 15.0], true);
    grapher.createBarChart(false, "Top Speed", "Speed (MPH)", METRIC_TYPES.VELOCITY, METRIC_FUNCS.MAX, null, false);

    // Create acceleration chart
    var check_template = "<input type='checkbox' value='NAME' id='NAME' onclick='acceleration_click_handler(this);'></input>" +
                         "<label for='NAME' style='color:white'> NAME</label> <br>";

    acceleration_graph = grapher.createXYGraph(false, "Acceleration vs Speed", "Speed (MPH)", "Acceleration (MPH/s)", METRIC_TYPES.ACCELERATION);

    for (var board in grapher.data[METRIC_TYPES.ACCELERATION]) {
        jQuery("#charts").append(replace(check_template, "NAME", board));
    }
}

function addCustomGraph() {
    v_start = parseFloat(document.forms["custom_chart"]["v_start"].value);
    v_end = parseFloat(document.forms["custom_chart"]["v_end"].value);

    document.forms["custom_chart"]["v_start"].value = "";
    document.forms["custom_chart"]["v_end"].value = "";

    if (isNaN(v_start) || isNaN(v_end)) {
        alert("Non-numerical inputs are invalid");
        return false;
    }

    if (v_end <= v_start) {
        alert("End velocity must be greater than start velocity");
        return false;
    }

    if (v_start < 2) {
        alert("Due to launch jitter and our data acquisition methodology, start velocities should be greater than or equal to 2 MPH.");
        return false;
    }

    grapher.createBarChart(true, "START-END MPH Times".replace("START", v_start).replace("END", v_end), "Time (seconds)", METRIC_TYPES.VELOCITY,
        METRIC_FUNCS.ACCELERATION, [v_start, v_end], true);

    return false;
}

//document.getElementById("viewport").setAttribute("content", "width=1000");