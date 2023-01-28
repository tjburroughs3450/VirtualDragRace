// by default, only production boards were shown on the website 
// set to true to show all boards (some hidden data may be incomplete or inaccurate)
var SHOW_ALL_BOARDS = false;

function createRace() {
    var length = $("#race_length").val();

    if (isNaN(length) || parseInt(length) < 2) {
        alert("Race length must be a number greater than two meters!");
        return;
    }


    boards = [];

    $(".board_check:checkbox:checked").each(function(index) { 
        boards.push($(this).val()); 
    });

    $("canvas").remove();

    var race_window = DataLoader.create(boards, parseInt(length), $(".site-aligner").width());

    //window.scrollTo(0,document.body.scrollHeight);

    setTimeout(function(){ race_window.start(); }, 500);
}

function setup(board_data) {
    $("body").append(
        `<div id="content">
            <div class="site-aligner" , id="race_window">
            <br>
            <font style="color:#ff7400; font-size: 20px;">Create Custom Race!</font>
            <br>
                <form id="creator">
                <br>
                <input id="race_length" name="race_length" value="20" type="text"></text>
                <label for="race_length" style="color:white;"> Race Distance (meters)</label>
                <br>
                <br>
                <input onclick="createRace()" type="button" value="Race!" style="background-color:#ff7400;
                border: none;
                color: #ffffff;
                padding: 10px 25px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;"></input>
                </form>
            </div>
        </div>`
    );

    board_checks = ""

    for (var i = 0; i < board_data.length; i++) {
        var board = board_data[i];
        
        var board_name = board.name;
        var board_samples = board.data;
        var board_color = board.color;
        var board_length = board.length_inches;
        var metric = board.metric;
        var visible = board.visible;
        var model = board.model;

        if (metric == "speed" && (visible || SHOW_ALL_BOARDS)) {
            DataLoader.load(board_name, board_color, board_length, board_samples, model);
            board_checks += `<input class="board_check" type="checkbox" id="${board_name}" name="${board_name}" value="${board_name}"><label for="${board_name}" style="color:white;"> ${board_name}</label><br>\n`;
        }
    }

    $("#creator").prepend(board_checks);
}

fetch('./board_data.json')
    .then((response) => response.json())
    .then(setup);