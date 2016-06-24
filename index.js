var Cell = require('./cell');
var LimitManager = require('./limit');


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
// questions = [
//     [1, 0, 5, 7, 0, 6, 0, 2, 0],
//     [0, 3, 0, 2, 0, 9, 0, 5, 1],
//     [0, 2, 0, 0, 0, 0, 7, 0, 0],
//     [0, 0, 3, 0, 0, 8, 5, 0, 0],
//     [0, 4, 0, 3, 0, 5, 0, 7, 0],
//     [0, 0, 1, 6, 0, 0, 9, 0, 0],
//     [0, 0, 8, 0, 0, 0, 0, 1, 0],
//     [3, 1, 0, 8, 0, 7, 0, 9, 0],
//     [0, 7, 0, 9, 0, 2, 8, 0, 4]
// ]
// questions = [
//     [0, 0, 6, 0, 5, 0, 3, 0, 4],
//     [0, 0, 0, 0, 4, 0, 9, 0, 1],
//     [0, 0, 2, 0, 0, 9, 0, 0, 6],
//     [2, 0, 1, 0, 9, 4, 8, 0, 0],
//     [0, 0, 0, 8, 0, 2, 0, 0, 0],
//     [0, 0, 7, 5, 3, 0, 2, 0, 9],
//     [3, 0, 0, 9, 0, 0, 1, 0, 0],
//     [5, 0, 9, 0, 8, 0, 0, 0, 0],
//     [6, 0, 8, 0, 1, 0, 4, 0, 0]
// ]
var cells = []
questions.forEach(function(item, rowIndex) {
    var y = rowIndex + 1;
    var len = item.length;
    var rowLimit = LimitManager.get("row", y);

    for (var columnIndex = 0; columnIndex < len; columnIndex++) {
        var columnLimit = LimitManager.get("column", columnIndex)
        var val = item[columnIndex] || 0;
        var x = columnIndex + 1;
        var cell = new Cell(x, y, val);
        cells.push(cell);
        var group;
        var index = Math.ceil((cell.x) / 3) + (Math.ceil(cell.y / 3) - 1) * 3;
        group = LimitManager.get("group", index)
        group.push(cell);
        rowLimit.push(cell);
        columnLimit.push(cell);
    }

})

// 初始化每个cell的可能值
cells.forEach(function(cell) {
    cell.initAlternate();
})
LimitManager.cal(['uniqueAlternate', 'coupleRemoveAlternate']);
console.log("*************************************")
LimitManager.print()
