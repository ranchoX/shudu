var utils = require('../utils');
var _ = require('underscore');
var LimitBase = require('./limitbase');
var debug = require('debug')('shudu:limit:column');
function ColumnLimit() {
    LimitBase.apply(this, arguments)
    this.name = "column";
}
utils.inherit(ColumnLimit, LimitBase)
module.exports=ColumnLimit;