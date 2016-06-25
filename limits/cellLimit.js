var _ = require('underscore');
var debug = require('debug')('shudu:limit:cell');

function CellLimit() {
    this.cells = [];
    this.emptyCells = [];
    this.values = []; //兼容baselimit;
}
CellLimit.prototype.push = function(cell) {
    this.cells.push(cell);
    if (!cell.val) {
        this.emptyCells.push(cell);
    }
    cell.limits.push(this);
}
CellLimit.prototype.addValues = function(cell) {
    var index = this.emptyCells.indexOf(cell);
    this.emptyCells.splice(index, 1);
}
CellLimit.prototype.findCell = function(x, y) {
    debug("查找cell: x:%s;y:%s,cells:%o", x, y)
    for (var i = 0; i < this.cells.length; i++) {
        if (this.cells[i].x == x && this.cells[i].y == y) {
            return this.cells[i];
        }
    }
}
CellLimit.prototype.cal = function(strategies) {
    var self = this;
    _.each(strategies, function(strategy) {
        if (self[strategy]) {
            self[strategy]();
        }
    })
    return this.checkCellValues();
}
CellLimit.prototype.xyRemove = function() {
        var self = this;
        //只有2个备选项的cell
        var cells = _.filter(this.emptyCells, function(cell) {
            return cell.values.length == 2
        })
        var numLink = {};
        _.each(cells, function(cell) {
            _.each(cell.values, function(num) {
                if (numLink[num]) {
                    numLink[num].push(cell);
                } else {
                    numLink[num] = [cell];
                }
            })
        })
        var waitRemoveNumCells = [];
        //查找xyz的cell
        _.each(cells, function(cell) {
            var x = cell.values[0];
            var y = cell.values[1];
            if (numLink[x].length >= 2 && numLink[y].length >= 2) {
                _.each(numLink[x], function(xCell) {
                    //先寻找有相同坐标x或者y的cell。
                    if (xCell != cell && (xCell.x == cell.x || xCell.y == cell.y)) {
                        var z = _.difference(xCell.values, [x])[0];
                        //z 必须不能等于y
                        if (z == y) {
                            return;
                        }
                        _.each(numLink[y], function(yCell) {
                            //如果数字y在yCell里面就构成xyz&&要和比较的cell同属任意一个limit
                            if (yCell != cell && yCell.values.indexOf(y) > -1 && yCell.values.indexOf(z) > -1 && (yCell.limitgroup === cell.limitgroup || yCell.limitcolumn === cell.limitcolumn || yCell.limitrow === cell.limitrow)) {
                                //cell xcell ycell不同同属任意一个limit
                                if ((yCell.limitgroup === cell.limitgroup && cell.limitgroup === xCell.limitgroup) || (yCell.limitcolumn === cell.limitcolumn && cell.limitcolumn === xCell.limitcolumn) ||
                                    (yCell.limitrow === cell.limitrow && cell.limitrow === xCell.limitrow)) {
                                    return;
                                }
                                debug('X', cell.x, cell.y, cell.values, ';', xCell.x, xCell.y, xCell.values, ';', yCell.x, yCell.y, yCell.values);
                                if (xCell.x == cell.x) {
                                    var resultCell = self.findCell(yCell.x, xCell.y);
                                    if (!resultCell.val) {
                                        //不能立刻执行，可能会影响当前计算的numCells的values值
                                        waitRemoveNumCells.push({
                                            cell: resultCell,
                                            num: z
                                        })
                                    }
                                }
                                if (xCell.y == cell.y) {
                                    var resultCell = self.findCell(xCell.x, yCell.y);
                                    if (!resultCell.val) {
                                        //不能立刻执行，可能会影响当前计算的numCells的values值
                                        waitRemoveNumCells.push({
                                            cell: resultCell,
                                            num: z
                                        })
                                    }
                                }

                            }
                        })
                    }
                })
                _.each(numLink[y], function(yCell) {
                    //先寻找有相同坐标x或者y的cell。
                    if (yCell != cell && (yCell.x == cell.x || yCell.y == cell.y)) {
                        var z = _.difference(yCell.values, [y])[0];
                        //z 必须不能等于x
                        if (z == x) {
                            return;
                        }
                        _.each(numLink[x], function(xCell) {
                            //如果数字y在yCell里面就构成xyz,同时和cell有在任意一个限制之内

                            if (xCell != cell && xCell.values.indexOf(x) > -1 && xCell.values.indexOf(z) > -1 && (xCell.limitgroup === cell.limitgroup || xCell.limitcolumn === cell.limitcolumn || xCell.limitrow === cell.limitrow)) {
                                if ((yCell.limitgroup === cell.limitgroup && cell.limitgroup === xCell.limitgroup) || (yCell.limitcolumn === cell.limitcolumn && cell.limitcolumn === xCell.limitcolumn) ||
                                    (yCell.limitrow === cell.limitrow && cell.limitrow === xCell.limitrow)) {
                                    return;
                                }
                                debug('Y', cell.x, cell.y, cell.values, ';', yCell.x, yCell.y, yCell.values, ';', xCell.x, xCell.y, xCell.values);
                                if (yCell.x == cell.x) {
                                    var resultCell = self.findCell(xCell.x, yCell.y);
                                    if (!resultCell.val) {
                                        //不能立刻执行，可能会影响当前计算的numCells的values值
                                        waitRemoveNumCells.push({
                                            cell: resultCell,
                                            num: z
                                        })
                                    }
                                } else if (yCell.y == cell.y) {
                                    var resultCell = self.findCell(yCell.x, xCell.y);
                                    if (!resultCell.val) {
                                        //不能立刻执行，可能会影响当前计算的numCells的values值
                                        waitRemoveNumCells.push({
                                            cell: resultCell,
                                            num: z
                                        })
                                    }
                                }

                            }
                        })
                    }
                })
            }
        })
        debug("waitRemoveNumCells:%o", _.map(waitRemoveNumCells, function(item) {
            return {
                x: item.cell.x,
                y: item.cell.y,
                values: item.cell.values,
                val: item.num
            }
        }))
        _.each(waitRemoveNumCells, function(item) {
            item.cell.removeAlternateValue(item.num);
        })
    }
    //唯一候选数法 http://www.llang.net/sudoku/skill/2-1.html
CellLimit.prototype.uniqueAlternate = function() {
    this.emptyCells.forEach(function(cell) {
        var values = [];
        cell.limits.forEach(function(limit) {
            values = values.concat(limit.values);
        })
        var results = _.unique(values);
        //提供给group 网格的规律过滤使用
        cell.values = _.difference(cell.values, results);
        debug("uniqueAlternate：x:%s;y:%s;values:%o", cell.x, cell.y, cell.values)
    })
}
CellLimit.prototype.checkCellValues = function() {
    var result = false;
    this.emptyCells.forEach(function(cell) {
        if (cell.cal()) {
            result = true;
        };
    })
    return result;
}
module.exports = CellLimit;
