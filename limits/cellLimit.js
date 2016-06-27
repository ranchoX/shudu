var _ = require('underscore');
var debug = require('debug')('shudu:limit:cell');

function interEmptysCell() {
    var cells = [];
    _.each(arguments, function(cell) {
        cells.push(cell.limitgroup.emptyCells.concat(cell.limitcolumn.emptyCells).concat(cell.limitrow.emptyCells))
    })
    return _.intersection.apply(null, cells);
}

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
                            waitRemoveNumCells.push({
                                xCell: xCell,
                                yCell: yCell,
                                num: z
                            })

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
                            waitRemoveNumCells.push({
                                xCell: xCell,
                                yCell: yCell,
                                num: z
                            })

                        }
                    })
                }
            })
        }
    })

    _.each(waitRemoveNumCells, function(item) {
        var cells = interEmptysCell(item.xCell, item.yCell);
        debug("xyRemove", item.xCell.x + ":" + item.xCell.y, item.yCell.x + ":" + item.yCell.y, _.map(cells, function(cell) {
            return cell.x + ":" + cell.y;
        }))
        _.each(cells, function(cell) {
            cell.removeAlternateValue(item.num);
        })
    })
}
CellLimit.prototype.xyzRemove = function() {
    var self = this;
    //只有2个备选项的cell
    var cells = _.filter(this.emptyCells, function(cell) {
        return cell.values.length == 2
    })
    var primaryCells = _.filter(this.emptyCells, function(cell) {
        return cell.values.length == 3;
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
    _.each(primaryCells, function(cell) {
        _.each(cell.values, function(num, index) {
            var z = num;
            _.each(numLink[z], function(xCell) {
                //先寻找有相同坐标x或者y的cell。
                if ((xCell.x == cell.x || xCell.y == cell.y)) {
                    var x = _.difference(xCell.values, [z])[0];
                    //z 必须不能等于y
                    if (cell.values.indexOf(x) == -1) {
                        return;
                    }
                    //find y
                    var y = _.difference(cell.values, [z, x])[0];
                    _.each(numLink[y], function(yCell) {
                        //如果数字y在yCell里面就构成xyz&&要和比较的cell同属任意一个limit
                        if (yCell.values.indexOf(y) > -1 && yCell.values.indexOf(z) > -1 && (yCell.limitgroup === cell.limitgroup)) {
                            //cell xcell ycell不同同属任意一个limit
                            if ((yCell.limitgroup === cell.limitgroup && cell.limitgroup === xCell.limitgroup) || (yCell.limitcolumn === cell.limitcolumn && cell.limitcolumn === xCell.limitcolumn) ||
                                (yCell.limitrow === cell.limitrow && cell.limitrow === xCell.limitrow)) {
                                return;
                            }
                            waitRemoveNumCells.push({
                                cell: cell,
                                xCell: xCell,
                                yCell: yCell,
                                num: z
                            })

                        }
                    })
                }
            })
        })
    })

    _.each(waitRemoveNumCells, function(item) {
        var cells = interEmptysCell(item.xCell, item.yCell, item.cell);
        debug("xyzRemove", item.cell.x + ":" + item.cell.y, item.xCell.x + ":" + item.xCell.y, item.yCell.x + ":" + item.yCell.y, _.map(cells, function(cell) {
            return cell.x + ":" + cell.y;
        }))
        _.each(cells, function(cell) {
            //排除自己
            if (cell != item.cell) {
                cell.removeAlternateValue(item.num);
            }

        })
    })
}
CellLimit.prototype.wxyzRemove = function() {
    var self = this;
    //只有2个备选项的cell
    var cells = _.filter(this.emptyCells, function(cell) {
        return cell.values.length == 2
    })
    var primaryCells = _.filter(this.emptyCells, function(cell) {
        return cell.values.length == 4;
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
    _.each(primaryCells, function(cell) {
        _.each(cell.values, function(num, index) {
            var z = num;
            _.each(numLink[z], function(xCell) {
                //先寻找有相同坐标x或者y的cell。
                if ((xCell.x == cell.x || xCell.y == cell.y)) {
                    var x = _.difference(xCell.values, [z])[0];
                    //z 必须不能等于y
                    if (cell.values.indexOf(x) == -1) {
                        return;
                    }
                    var yw = _.difference(cell.values, [z, x]);
                    _.each(yw, function(y) {
                        _.each(numLink[y], function(yCell) {
                            if (yCell.values.indexOf(z) > -1 && ((yCell.x == cell.x && xCell.x == cell.x) || (yCell.y == cell.y && xCell.y == cell.y))) {
                                var w = _.difference(cell.values, [z, x, y])[0];
                                if (cell.values.indexOf(w) == -1) {
                                    return;
                                }

                                //find wz
                                _.each(numLink[w], function(wCell) {
                                    if (wCell.values.indexOf(z) > -1 && wCell.limitgroup == cell.limitgroup) {
                                        waitRemoveNumCells.push({
                                            cell: cell,
                                            xCell: xCell,
                                            wCell: wCell,
                                            num: z
                                        })
                                    }
                                })

                            }
                        })
                    })
                }
            })
        })
    })

    _.each(waitRemoveNumCells, function(item) {
        var cells = interEmptysCell(item.xCell, item.wCell, item.cell);
        debug("wxyzRemove", item.cell.x + ":" + item.cell.y, item.xCell.x + ":" + item.xCell.y, item.wCell.x + ":" + item.wCell.y, _.map(cells, function(cell) {
            return cell.x + ":" + cell.y;
        }))
        _.each(cells, function(cell) {
            //排除自己
            if (cell != item.cell) {
                cell.removeAlternateValue(item.num);
            }
        })
    })
}
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
CellLimit.prototype.isResolve = function() {
    return this.emptyCells.length == 0;
}
CellLimit.prototype.hasAnswer = function() {
    var re = true;
    _.each(this.emptyCells, function(cell) {
        if (cell.values.length == 0) {
            console.log("该cell没有可能值了", cell.x, cell.y)
            re = false;
        }
    })
    return re;
}
CellLimit.prototype.cloneCellValues = function() {
    var cells = [];
    _.each(this.emptyCells, function(cell) {
        cells.push({
            x: cell.x,
            y: cell.y,
            values: _.clone(cell.values)
        })
    })
    return cells;
}
CellLimit.prototype.restoreCellValues = function(cloneCells) {
    var self = this;
    self.emptyCells = [];
    _.each(self.cells, function(cell) {
        _.each(cloneCells, function(clone) {
            if (cell.x == clone.x && cell.y == clone.y) {
                delete cell.val;
                cell.values = clone.values;
                self.emptyCells.push(cell);
            }
        })
    })

}
CellLimit.prototype.getSortCells = function() {
    return _.sortBy(this.emptyCells, function(cell) {
        return cell.values.length;
    })
}
module.exports = CellLimit;
