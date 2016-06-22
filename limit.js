var utils = require('./utils');
var _ = require('underscore');
var debug = require('debug')('shudu:limit');
var NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function LimitBase(index, name) {
    this.name = name;
    this.index = index;
    this.cells = [];
    this.values = []; //已经存在的集合
    this.emptyCells =[];
}
LimitBase.prototype.push = function(cell) {
    this.cells.push(cell);
    if (cell.val) {
        this.values.push(cell.val)
    }else{
        this.emptyCells.push(cell);
    }
}
LimitBase.prototype.addValues = function(cell) {
        this.values.push(cell.val);
        //将其他cell的可选值删除该值
        this.cells.forEach(function(cell) {
            cell.removeAlternateValue(cell.val);
        })
        var index = this.emptyCells.indexOf(cell);
        this.emptyCells.splice(index,1);
    }
    // 隐性唯一候选数法 http://www.llang.net/sudoku/skill/2-2.html
LimitBase.prototype.cal = function() {
    this.uniqueAlternate();
    this.coupleRemoveAlternate();
    return this.checkCellValues();
}
LimitBase.prototype.uniqueAlternate = function() {
        var self = this;
        this.cells.forEach(function(cell) {
            if (!cell.val) {
                var otherValues = [];
                self.cells.forEach(function(other) {
                    if (other != cell && (!other.val)) {
                        otherValues = otherValues.concat(other.values);
                    }
                })
                debug('limit uniqueAlternate:x:%s;y:%s;otherValues:%o;values:%o', cell.x, cell.y, _.unique(otherValues), cell.values)
                var results = _.difference(cell.values, otherValues);
                if (results.length == 1) {
                    cell.setValue(results[0])
                }
            }
        })
    }
    //候选数 删减法
LimitBase.prototype.coupleRemoveAlternate = function() {
    var link = {};
    var self = this;
    this.cells.forEach(function(cell) {
        if (!cell.val) {
            if (link[cell.values.length]) {
                link[cell.values.length].push(cell)
            } else {
                link[cell.values.length] = [cell]
            }
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
                self.cells.forEach(function(cell) {
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
    this.cells.forEach(function(cell) {
        if (cell.cal()) {
            result = true;
        };
    })
    return result;
}

function CommonLimit() {
    LimitBase.apply(this, arguments)
}

function GroupLimit() {
    LimitBase.apply(this, arguments)
}
//候选数区块删减法
GroupLimit.prototype.blockRemoveAlternate = function() {
    var nums = _.difference(NUMS, this.values);
    if (nums.length > 1) {
        var emptyCells = _.filters
        _.each(nums, function(num) {
            
        })
    }

}
utils.inherit(CommonLimit, LimitBase)
var limitManager = function() {
    function cal(index) {
        index = index || 0;
        index++;
        debug('第' + index + '次计算')
        var result = false;
        limits.forEach(function(item) {
            if (item.cal()) {
                result = true;
            };
        })
        if (result) {
            cal(index);
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
                var limit = new CommonLimit(index, type)
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
