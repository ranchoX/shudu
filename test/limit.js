var _ = require('underscore');
var should = require('should')
var Limit = require('../limit');
var Cell = require('../cell');
var CommonLimit = Limit.CommonLimit;
describe('==>limit ', function() {
    it('内cell 唯一值查找', function() {
        //test for uniqueAlternate
        var limit = new CommonLimit(1, "column");
        var cell = new Cell(1, 1);
        cell.values = [3, 4];
        var cell2 = new Cell(1, 2);
        cell2.values = [3, 6, 7];
        var cell3 = new Cell(1, 3);
        cell3.values = [2];
        var cell4 = new Cell(1, 4);
        cell4.values = [8, 9, 3, 6];
        limit.push(cell);
        limit.push(cell2);
        limit.push(cell3);
        limit.push(cell4);
        cell.limits.push(limit);
        cell2.limits.push(limit);
        cell3.limits.push(limit);
        cell4.limits.push(limit);
        limit.uniqueAlternate();
        cell.should.have.property('val').and.equal(4);
        cell2.should.have.property('val').and.equal(7);
        cell3.should.have.property('val').and.equal(2);
        cell4.values.should.eql([8, 9, 3, 6])
        limit.values.should.eql([4,7,2])
    })
    it("候选数 删减法", function() {
        var limit = new CommonLimit(1, "column");
        var cell = new Cell(1, 1);
        cell.values = [3, 4];
        var cell2 = new Cell(1, 2);
        cell2.values = [3, 4];
        var cell3 = new Cell(1, 3);
        cell3.values = [2, 3, 4];
        var cell4 = new Cell(1, 4);
        cell4.values = [8, 9, 3, 6, 4];
        limit.push(cell);
        limit.push(cell2);
        limit.push(cell3);
        limit.push(cell4);
        cell.limits.push(limit);
        cell2.limits.push(limit);
        cell3.limits.push(limit);
        cell4.limits.push(limit);
        limit.coupleRemoveAlternate();
        cell3.values.should.eql([2])
        cell4.values.should.eql([8, 9, 6])
    })
    it("公开的cal方法", function() {
        var limit = new CommonLimit(1, "column");
        var cell = new Cell(1, 1);
        cell.values = [3, 4];
        var cell2 = new Cell(1, 2);
        cell2.values = [3, 4];
        var cell3 = new Cell(1, 3);
        cell3.values = [2, 3, 4];
        var cell4 = new Cell(1, 4);
        cell4.values = [2, 9, 3, 6, 4];
        limit.push(cell);
        limit.push(cell2);
        limit.push(cell3);
        limit.push(cell4);
        cell.limits.push(limit);
        cell2.limits.push(limit);
        cell3.limits.push(limit);
        cell4.limits.push(limit);
        limit.cal();
        cell3.should.have.property('val').and.eql(2)
        cell4.values.should.eql([9, 6])
        limit.values.should.eql([2])
    })
})
