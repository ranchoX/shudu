var _ = require('underscore');
var should = require('should')
var Limit = require('../limit');
var Cell = require('../cell');
var CommonLimit = Limit.CommonLimit;
describe('==>cell ', function() {
	it("初始化initAlternate",function(){
		var limit1 = new CommonLimit(1, "column");
        var cell = new Cell(1, 1, 4);
        limit1.push(cell);
        cell.limits.push(limit1);
        var cell2 = new Cell(1, 2);
        limit1.push(cell2);
        cell2.limits.push(limit1);

        var cellTest = new Cell(1, 3);
        limit1.push(cellTest);
        cellTest.limits.push(limit1);

        var limit3 = new CommonLimit(3, "row");
         var cell4 = new Cell(8, 3, 9);
        limit3.push(cell4);
        cell4.limits.push(limit3);

        var cell5 = new Cell(3, 3);
        limit3.push(cell5);
        cell5.limits.push(limit3);

        limit3.push(cellTest);
        cellTest.limits.push(limit3);

        cellTest.initAlternate();
        cellTest.values.should.eql([1,2,3,5,6,7,8])
        limit1.values.should.eql([4])
        limit3.values.should.eql([9])
	})
})