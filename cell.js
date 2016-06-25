var _ = require('underscore');
var debug = require('debug')('shudu:cell');
function Cell(x, y, val) {
    this.x = x;
    this.y = y;
    if (val) {
        this.val = val;
    }else{
        this.values = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
    this.limits = [];

}

Cell.prototype.cal = function() {
    if ((!this.val) && this.values.length == 1) {
        this.setValue(this.values[0]);
        return true;
    }
    return false;
}
Cell.prototype.removeAlternateValue = function(val){
    if (!this.val) {
        var index = this.values.indexOf(val);
        if (index > -1) {
            debug('删除候选值 x:%s,y:%s,val:%s,values:%o',this.x,this.y,val,this.values);
            this.values.splice(index, 1);
        }
    }
}
Cell.prototype.setValue = function(val) {
    debug("**************设置值：x:%s;y:%s;val:%s", this.x, this.y, val)
    if (!val) {
        return;
    }
    this.val = val;
    var self =this;
    this.limits.forEach(function(limit) {
            limit.addValues(self);
        })
    delete this.values;
}
module.exports = Cell;
