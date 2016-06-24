var _ = require('underscore');
var should = require('should')

var Cell = require('../cell');
var LimitManager = require('../limit');
describe('==>limit ', function() {
    it('内cell 唯一值查找', function() {
        var limit = LimitManager.get("column", 1);
        var cell = new Cell(1, 1);
        cell.values = [3, 4];
        var cell2 = new Cell(1, 2);
        cell2.values = [3, 6, 7];
        limit.push(cell);
        limit.push(cell2);
        limit.uniqueAlternate();
        limit.checkCellValues();
        cell.should.have.property('val', 4)
        limit.values.should.eql([4])
    })
    it("候选数 删减法", function() {
        var limit = LimitManager.get("column", 2);
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
        limit.coupleRemoveAlternate();
        cell3.values.should.eql([2])
        cell4.values.should.eql([8, 9, 6])
    })
    it("公开的cal方法", function() {
        var limit = LimitManager.get("column", 3);
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
        LimitManager.cal();
        cell3.should.have.property('val', 2);
        cell4.values.should.eql([9, 6])
        limit.values.should.eql([2])
    })
    it.only("blockRemoveAlternate",function(){
        var groupLimit = LimitManager.get("group",1);
        var rowLimit = LimitManager.get("row",3);
        var cell11 = new Cell(1,1);
        cell11.values=[3,4];

        var cell21 = new Cell(2,1);
        cell21.values=[3,5];

        var cell12 = new Cell(1,2);
        cell12.values=[8,4];

        var cell22 = new Cell(2,2);
        cell22.values=[9,1];

        groupLimit.push(cell11)
        groupLimit.push(cell21)
        groupLimit.push(cell12)
        groupLimit.push(cell22)

        var cell41 = new Cell(4,1);
        cell41.values=[3,9,8];

        var cell51 = new Cell(5,1);
        cell51.values=[3,7,6];

        rowLimit.push(cell11)
        rowLimit.push(cell21)
        rowLimit.push(cell41)
        rowLimit.push(cell51)
        LimitManager.cal(['blockRemoveAlternate'])
        cell41.values.should.eql([9,8])
        cell51.values.should.eql([7,6])
    })
})
