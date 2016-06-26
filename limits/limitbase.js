var _ = require('underscore');
var debug = require('debug')('shudu:limit:base');

function LimitBase(index) {
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
        var waitRemoveCells = [];
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
                waitRemoveCells.push({ cell: cell, num: results[0] });
            }
        })
        _.each(waitRemoveCells, function(item) {
            item.cell.setValue(item.num);
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
LimitBase.prototype.resetCells = function() {
    var emptyCells = [];
    var values = [];
    _.each(this.cells, function(cell) {
        if (cell.val) {
            values.push(cell.val);
        } else {
            emptyCells.push(cell);
        }
    })
    this.emptyCells = emptyCells;
    this.values = values;
}
module.exports = LimitBase;
