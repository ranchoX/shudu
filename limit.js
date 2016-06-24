var utils = require('./utils');
var _ = require('underscore');
var debug = require('debug')('shudu:limit');
var NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function LimitBase(index, name) {
    this.name = name;
    this.index = index;
    this.cells = [];
    this.values = []; //已经存在的集合
    this.emptyCells = [];
}
LimitBase.prototype.push = function(cell) {
    this.cells.push(cell);
    if (cell.val) {
        this.values.push(cell.val)
    } else {
        this.emptyCells.push(cell);
    }
    //todo:最好能修改为name
    cell.limits.push(this);
    cell["limit" + this.name] = this;
}
LimitBase.prototype.addValues = function(cell) {
    this.values.push(cell.val);
    var index = this.emptyCells.indexOf(cell);
    this.emptyCells.splice(index, 1);
    //将其他cell的可选值删除该值
    this.emptyCells.forEach(function(item) {
        item.removeAlternateValue(cell.val);
    })
}

LimitBase.prototype.cal = function(strategies) {
    var self = this;
    _.each(strategies, function(strategy) {
        if (self[strategy]) {
            self[strategy]();
        }
    })

    return this.checkCellValues();
}
LimitBase.prototype.uniqueAlternate = function() {
        var self = this;
        this.emptyCells.forEach(function(cell) {
            var otherValues = [];
            self.emptyCells.forEach(function(other) {
                if (other != cell) {
                    otherValues = otherValues.concat(other.values);
                }
            })
            debug('limit uniqueAlternate:x:%s;y:%s;otherValues:%o;values:%o', cell.x, cell.y, _.unique(otherValues), cell.values)
            var results = _.difference(cell.values, otherValues);
            if (results.length == 1) {
                cell.setValue(results[0])
            }
        })
    }
    //候选数 删减法
LimitBase.prototype.coupleRemoveAlternate = function() {
    var link = {};
    var self = this;
    this.emptyCells.forEach(function(cell) {
        if (link[cell.values.length]) {
            link[cell.values.length].push(cell)
        } else {
            link[cell.values.length] = [cell]
        }
    })
    for (var key in link) {
        if (link[key].length > 1 && link[key].length + "" == key) {
            //deep equal
            var unionArr = _.union.apply(null, link[key].map(function(item) {
                return item.values;
            }))
            if (unionArr.length == link[key][0].values.length) {
                debug("coupleRemoveAlternate:length:%s;values:%o", key, unionArr)
                    //将其他的备选结果删除 当前cells中的选择项
                self.emptyCells.forEach(function(cell) {
                    if (link[key].indexOf(cell) == -1) {
                        debug("trigger remove values:x:%s,y%s,union:%o", cell.x, cell.y, unionArr)
                        cell.values = _.difference(cell.values, unionArr);
                        debug("after:x:%s,y%s,values:%o", cell.x, cell.y, cell.values)
                    }
                })
            };
        }
    }
}
LimitBase.prototype.checkCellValues = function() {
    var result = false;
    this.emptyCells.forEach(function(cell) {
        if (cell.cal()) {
            result = true;
        };
    })
    return result;
}

function CommonLimit() {
    LimitBase.apply(this, arguments)
}
utils.inherit(CommonLimit, LimitBase)

function GroupLimit() {
    LimitBase.apply(this, arguments)
}
utils.inherit(GroupLimit, LimitBase)
//候选数区块删减法
GroupLimit.prototype.blockRemoveAlternate = function() {
    var self = this;
    if (this.emptyCells.length > 1) {
        var nums = _.difference(NUMS, this.values);
        nums.forEach(function(num) {
            var numCells = _.filter(self.emptyCells, function(cell) {
                return cell.values.indexOf(num) > -1;
            })
            if (numCells.length > 1) {
                //是否在同行或者同列
                var x = numCells[0].x;
                var y = numCells[0].y;
                var isColumnFill = true;
                var isRowFill = true;
                _.each(numCells, function(cell) {
                    if (cell.x != x) {
                        isColumnFill = false;
                    }
                    if (cell.y != y) {
                        isRowFill = false;
                    }
                })
                var waitRemoveNumCells;
                if (isColumnFill) {
                    waitRemoveNumCells = numCells[0]["limitcolumn"]&&numCells[0]["limitcolumn"].emptyCells
                } else if (isRowFill) {
                    waitRemoveNumCells = numCells[0]["limitrow"]&&numCells[0]["limitrow"].emptyCells
                }
                _.each(waitRemoveNumCells, function(cell) {
                    //不在group里面的cell 进行删除备选项
                    if (numCells.indexOf(cell) == -1) {
                        cell.removeAlternateValue(num);
                    }
                })
            }
        })
    }

}

var limitManager = function() {
    function cal(strategies, index) {
        strategies = strategies || ['uniqueAlternate', 'coupleRemoveAlternate','blockRemoveAlternate']
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
            cal(strategies, index);
        }
    }
    var limits = [];
    var map = {};
    return {
        cal: cal,
        get: function(type, index) {
            var key = type + "|" + index;
            if (map[key]) {
                return map[key]
            } else {
                var limit = type == "group" ? new GroupLimit(index, type) : new CommonLimit(index, type)
                map[key] = limit;
                limits.push(limit);
                return limit;
            }
        },
        print: function() {
            var rows = []
            limits.forEach(function(item) {

                if (item.name == "row") {
                    var row = [];
                    item.cells.forEach(function(item) {
                        row.push(item.val);
                    })
                    rows.push(row.join(","));
                }
            })
            console.log(rows.join("\n"))
        }
    }
}
module.exports = limitManager();
