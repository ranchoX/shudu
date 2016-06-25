var utils = require('../utils');
var _ = require('underscore');
var debug = require('debug')('shudu:limit:group');
var LimitBase = require('./limitbase');


function GroupLimit() {
    LimitBase.apply(this, arguments)
    this.name = "group";
}
utils.inherit(GroupLimit, LimitBase)
    //候选数区块删减法
GroupLimit.prototype.blockRemoveAlternate = function() {
    var self = this;
    if (this.emptyCells.length > 1) {
        var nums = _.difference([1,2,3,4,5,6,7,8,9], this.values);
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
                    waitRemoveNumCells = numCells[0]["limitcolumn"] && numCells[0]["limitcolumn"].emptyCells
                } else if (isRowFill) {
                    waitRemoveNumCells = numCells[0]["limitrow"] && numCells[0]["limitrow"].emptyCells
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
module.exports=GroupLimit;