var _ = require('underscore');
var debug = require('debug')('shudu:limit');
var Cell = require('./cell');
var STRATEGIES = ['uniqueAlternate', 'coupleRemoveAlternate', 'blockRemoveAlternate','xyRemove'];
var CellLimit = require('./limits/cellLimit');
var RowLimit = require('./limits/rowLimit');
var ColumnLimit = require('./limits/columnLimit');
var GroupLimit = require('./limits/groupLimit');
var limitManager = function() {

    var groupLink = {};
    var limits = [];
    var cellLimit = new CellLimit();
    limits.push(cellLimit);

    function getGroupLimit(index) {
        if (!groupLink[index]) {
            groupLink[index] = new GroupLimit(index)
            limits.push(groupLink[index])
        }
        return groupLink[index]
    }
    var columnLink = {};

    function getColumnLimit(index) {
        if (!columnLink[index]) {
            columnLink[index] = new ColumnLimit(index)
            limits.push(columnLink[index])
        }
        return columnLink[index]
    }
    var rowLink = {};

    function getRowLimit(index) {
        if (!rowLink[index]) {
            rowLink[index] = new RowLimit(index)
            limits.push(rowLink[index])
        }
        return rowLink[index]
    }

    function addCell(cell) {
        var index = Math.ceil((cell.x) / 3) + (Math.ceil(cell.y / 3) - 1) * 3;
        cellLimit.push(cell);
        getGroupLimit(index).push(cell);
        getColumnLimit(cell.x).push(cell)
        getRowLimit(cell.y).push(cell);

    }

    function resolve(strategies, index) {
        strategies = strategies || STRATEGIES;
        index = index || 0;
        index++;
        debug('第' + index + '次计算')
        var result = false;
        limits.forEach(function(item) {
            if (item.cal(strategies)) {
                result = true;
            };
        })
        if (result) {
            resolve(strategies, index);
        }
    }
    return {
        resolve: resolve,
        print: function() {
            var rows = []
            for (var index in rowLink) {
                var row = [];
                rowLink[index].cells.forEach(function(item) {
                    row.push(item.val||'['+item.values.join(',')+']');
                })
                rows.push(row.join(","));
            }
            console.log(rows.join("\n"))
        },
        loadQuestion: function(questions) {
            //todo:check valid
            questions.forEach(function(row, rowIndex) {
                var y = rowIndex + 1;
                var len = row.length;
                for (var columnIndex = 0; columnIndex < len; columnIndex++) {
                    var x = columnIndex + 1;
                    var val = row[columnIndex];
                    var cell = new Cell(x, y, val);
                    addCell(cell);
                }

            })
        }
    }
}
module.exports = limitManager();
