var LimitManager = require('./limitManager');


var questions = [
    [6, 4, 0, 0, 0, 0, 0, 0, 1],
    [7, 0, 8, 4, 0, 0, 0, 5, 0],
    [0, 0, 0, 5, 0, 0, 4, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 0, 0],
    [4, 5, 9, 1, 0, 6, 2, 3, 8],
    [0, 0, 0, 8, 0, 0, 0, 0, 0],
    [0, 0, 7, 0, 0, 1, 0, 0, 0],
    [0, 8, 0, 0, 0, 4, 9, 0, 6],
    [2, 0, 0, 0, 0, 0, 0, 1, 3]
]


LimitManager.loadQuestion(questions)
LimitManager.resolve();
LimitManager.print()
