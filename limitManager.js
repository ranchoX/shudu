var _ = require('underscore');
var debug = require('debug')('shudu:limitmanager');
var Cell = require('./cell');
var CellLimit = require('./limits/cellLimit');
var RowLimit = require('./limits/rowLimit');
var ColumnLimit = require('./limits/columnLimit');
var GroupLimit = require('./limits/groupLimit');
var limitManager = function() {
    var currentStrategies = ['uniqueAlternate', 'coupleRemoveAlternate', 'blockRemoveAlternate', 'xyRemove', 'xyzRemove', 'wxyzRemove']
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

    function guessResolve() {
        var cells = cellLimit.getSortCells();
        for (var i = 0; i < cells.length; i++) {
            var cloneCells = cellLimit.cloneCellValues()
                //开始猜想
            if (guessCell(cloneCells, cells[i])) {
                return true;
            }
        }

    }

    function guessCell(cloneCells, cell) {
        for (var j = 0; j < cell.values.length; j++) {

            debug('猜想x:%s,y:%s,val:%s', cell.x, cell.y, cell.values[j]);
            cell.setValue(cell.values[j])
            if (resolve()) {
                console.log("********guessCell success*******")
                return true;
            } else {
                //猜想失败还原
                console.log("-----还原-----",cell.x,cell.y)
                cellLimit.restoreCellValues(cloneCells);
                _.each(limits, function(limit) {
                    if (limit.resetCells) {
                        limit.resetCells();
                    }
                })
            }
        }
        return false;
    }

    function resolve(index) {
        index = index || 0;
        index++;
        debug('第' + index + '次计算')
        var result = false;
        limits.forEach(function(item) {
            if (item.cal(currentStrategies)) {
                result = true;
            };
        })
        if (result) {
            resolve(index);
        }
        if (cellLimit.isResolve()) {
            return true;
        } else {
            if (cellLimit.hasAnswer()) {
                console.log("￥￥￥￥￥￥￥￥子递归")
                return guessResolve();
            } else {
                return false;
            }
        }
    }
    return {
        resolve: function(strategies) {
            if (strategies) {
                currentStrategies = strategies;
            }

            resolve();
        },
        print: function() {
            var rows = []
            for (var index in rowLink) {
                var row = [];
                rowLink[index].cells.forEach(function(item) {
                    row.push(item.val || '[' + item.values.join(',') + ']');
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
