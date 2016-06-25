var utils = require('../utils');
var _ = require('underscore');
var debug = require('debug')('shudu:limit:row');
var LimitBase = require('./limitbase');

function RowLimit() {
    LimitBase.apply(this, arguments)
    this.name = "row";
}
utils.inherit(RowLimit, LimitBase)
module.exports=RowLimit