function setup(boards) {
    for (var i = 0; i < boards.length; i++) {
        var board = boards[i];
        if (board.visible || SHOW_ALL_BOARDS) {
            grapher.addXYData(board.name, board.color, board.metric, board.data);
        }
    }

    showDefaultGraphs();
}

fetch('./board_data.json')
    .then((response) => response.json())
    .then(setup);