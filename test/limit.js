var _ = require('underscore');
var should = require('should')

var Cell = require('../cell');
var LimitManager = require('../limitManager');
var CellLimit = require('../limits/cellLimit');
var GroupLimit = require('../limits/groupLimit');
var BaseLimit = require('../limits/limitbase');
var RowLimit = require('../limits/rowLimit');
var ColumnLimit = require('../limits/columnLimit');
describe.only('===>cell limit', function() {
    //cell unique
    it('生成唯一可能值', function() {
        var cellLimit = new CellLimit();
        var groupLimit = new GroupLimit(1);
        var cell = new Cell(1, 1, 3);
        var cell2 = new Cell(1, 2);
        cellLimit.push(cell)
        cellLimit.push(cell2)
        groupLimit.push(cell)
        groupLimit.push(cell2)
        cellLimit.uniqueAlternate();
        cell2.values.should.eql([1, 2, 4, 5, 6, 7, 8, 9]);
    })
    it('xy 删除候选法(xy yz xz 有2个在同一个group情况下，排除多个)', function() {
        var cell22 = new Cell(2, 2);
        cell22.values = [3, 4];
        var cell33 = new Cell(3, 3);
        cell33.values = [4, 8];

        var cell25 = new Cell(2, 5);
        cell25.values = [3, 8];

        var cell35 = new Cell(3, 5);
        cell35.values = [8, 9, 6];
        var cellLimit = new CellLimit();
        var rowLimit2 = new RowLimit(2);
        var rowLimit3 = new RowLimit(3);
        var rowLimit5 = new RowLimit(4);
        var columnLimit2 = new ColumnLimit(2);
        var columnLimit3 = new ColumnLimit(3);

        var groupLimit1 = new GroupLimit(1);
        var groupLimit4 = new GroupLimit(4);
        cellLimit.push(cell22)
        cellLimit.push(cell33)
        cellLimit.push(cell25)
        cellLimit.push(cell35)

        rowLimit2.push(cell22)
        rowLimit3.push(cell33)
        rowLimit5.push(cell25)
        rowLimit5.push(cell35)

        columnLimit2.push(cell22)
        columnLimit2.push(cell25)
        columnLimit3.push(cell33)
        columnLimit3.push(cell35)

        groupLimit1.push(cell22)
        groupLimit1.push(cell33)
        groupLimit4.push(cell25)
        groupLimit4.push(cell35)
        cellLimit.xyRemove();
        cell35.values.should.eql([9, 6]);
    })
    it('xy 删除候选法 (xy yz xz 各在一个group情况下只排除一个)', function() {
        var cell22 = new Cell(2, 2);
        cell22.values = [3, 4];
        var cell33 = new Cell(3, 3);
        cell33.values = [4, 8];

        var cell25 = new Cell(2, 5);
        cell25.values = [3, 8];

        var cell35 = new Cell(3, 5);
        cell35.values = [8, 9, 6];
        var cellLimit = new CellLimit();
        var rowLimit2 = new RowLimit(2);
        var rowLimit3 = new RowLimit(3);
        var rowLimit5 = new RowLimit(4);
        var columnLimit2 = new ColumnLimit(2);
        var columnLimit3 = new ColumnLimit(3);

        var groupLimit1 = new GroupLimit(1);
        var groupLimit4 = new GroupLimit(4);
        cellLimit.push(cell22)
        cellLimit.push(cell33)
        cellLimit.push(cell25)
        cellLimit.push(cell35)

        rowLimit2.push(cell22)
        rowLimit3.push(cell33)
        rowLimit5.push(cell25)
        rowLimit5.push(cell35)

        columnLimit2.push(cell22)
        columnLimit2.push(cell25)
        columnLimit3.push(cell33)
        columnLimit3.push(cell35)

        groupLimit1.push(cell22)
        groupLimit1.push(cell33)
        groupLimit4.push(cell25)
        groupLimit4.push(cell35)
        cellLimit.xyRemove();
        cell35.values.should.eql([9, 6]);
    })
    it('xy 删除候选法(xy yz xz 都相等情况，不能排除)', function() {
        var cell22 = new Cell(2, 2);
        cell22.values = [3, 4];
        var cell33 = new Cell(3, 3);
        cell33.values = [4, 3];

        var cell25 = new Cell(2, 5);
        cell25.values = [3, 4];

        var cell35 = new Cell(3, 5);
        cell35.values = [4, 9, 6];
        var cellLimit = new CellLimit();
        var rowLimit2 = new RowLimit(2);
        var rowLimit3 = new RowLimit(3);
        var rowLimit5 = new RowLimit(4);
        var columnLimit2 = new ColumnLimit(2);
        var columnLimit3 = new ColumnLimit(3);

        var groupLimit1 = new GroupLimit(1);
        var groupLimit4 = new GroupLimit(4);
        cellLimit.push(cell22)
        cellLimit.push(cell33)
        cellLimit.push(cell25)
        cellLimit.push(cell35)

        rowLimit2.push(cell22)
        rowLimit3.push(cell33)
        rowLimit5.push(cell25)
        rowLimit5.push(cell35)

        columnLimit2.push(cell22)
        columnLimit2.push(cell25)
        columnLimit3.push(cell33)
        columnLimit3.push(cell35)

        groupLimit1.push(cell22)
        groupLimit1.push(cell33)
        groupLimit4.push(cell25)
        groupLimit4.push(cell35)
        cellLimit.xyRemove();
        cell35.values.should.eql([4, 9, 6]);
    })
    it('xyz 删除候选法(排除xy xz yz 都在一个 group limit情况,不能排除)', function() {
        var cell22 = new Cell(2, 2);
        cell22.values = [3, 4];
        var cell23 = new Cell(2, 3);
        cell23.values = [4, 8];

        var cell33 = new Cell(3, 3);
        cell33.values = [3, 8];

        var cell32 = new Cell(3, 2);
        cell32.values = [3, 8, 7, 9];

        var cellLimit = new CellLimit();
        var rowLimit2 = new RowLimit(2);
        var rowLimit3 = new RowLimit(3);
        var columnLimit2 = new ColumnLimit(2);
        var columnLimit3 = new ColumnLimit(3);

        var groupLimit1 = new GroupLimit(1);
        cellLimit.push(cell22)
        cellLimit.push(cell23)
        cellLimit.push(cell33)
        cellLimit.push(cell32)

        rowLimit2.push(cell22)
        rowLimit2.push(cell32)
        rowLimit3.push(cell23)
        rowLimit3.push(cell33)

        columnLimit2.push(cell22)
        columnLimit2.push(cell23)
        columnLimit3.push(cell32)
        columnLimit3.push(cell33)

        groupLimit1.push(cell22)
        groupLimit1.push(cell23)
        groupLimit1.push(cell32)
        groupLimit1.push(cell33)
        cellLimit.xyRemove();
        cell32.values.should.eql([3, 8, 7, 9]);
    })
    it('xyz 删除候选法(xyz yz xz 有2个在同一个group情况下，排除多个)', function() {
        var cell22 = new Cell(2, 2);
        cell22.values = [3, 4, 8];
        var cell33 = new Cell(3, 3);
        cell33.values = [4, 8];

        var cell25 = new Cell(2, 5);
        cell25.values = [3, 8];

        var cell21 = new Cell(2, 1);
        cell21.values = [8, 9, 6];

        var cell23 = new Cell(2, 3);
        cell23.values = [8, 3, 2];
        var cellLimit = new CellLimit();
        var rowLimit1 = new RowLimit(1);
        var rowLimit2 = new RowLimit(2);
        var rowLimit3 = new RowLimit(3);
        var rowLimit5 = new RowLimit(4);
        var columnLimit2 = new ColumnLimit(2);
        var columnLimit3 = new ColumnLimit(3);

        var groupLimit1 = new GroupLimit(1);
        var groupLimit4 = new GroupLimit(4);
        cellLimit.push(cell22)
        cellLimit.push(cell33)
        cellLimit.push(cell25)
        cellLimit.push(cell21)
        cellLimit.push(cell23)

        rowLimit1.push(cell21)
        rowLimit2.push(cell22)
        rowLimit3.push(cell23)
        rowLimit3.push(cell33)
        rowLimit5.push(cell25)

        columnLimit2.push(cell22)
        columnLimit2.push(cell21)
        columnLimit2.push(cell23)
        columnLimit2.push(cell25)
        columnLimit3.push(cell33)

        groupLimit1.push(cell22)
        groupLimit1.push(cell21)
        groupLimit1.push(cell23)
        groupLimit1.push(cell33)
        groupLimit4.push(cell25)
        cellLimit.xyzRemove();
        cell21.values.should.eql([9, 6]);
        cell23.values.should.eql([3, 2])
    })

    it('wxyz 删除候选法(wxyz yz xz wz有wz wxyz在同一个group情况下，排除多个)', function() {
        var cell22 = new Cell(2, 2);
        cell22.values = [2,3, 4, 8];
        var cell33 = new Cell(3, 3);
        cell33.values = [4, 8];

        var cell25 = new Cell(2, 5);
        cell25.values = [3, 8];

        var cell27 = new Cell(2, 7);
        cell27.values = [2, 8];

        var cell21 = new Cell(2, 1);
        cell21.values = [8, 9, 6];

        var cell23 = new Cell(2, 3);
        cell23.values = [8, 3, 2];
        var cellLimit = new CellLimit();
        var rowLimit1 = new RowLimit(1);
        var rowLimit2 = new RowLimit(2);
        var rowLimit3 = new RowLimit(3);
        var rowLimit5 = new RowLimit(4);
        var rowLimit7 = new RowLimit(7);
        var columnLimit2 = new ColumnLimit(2);
        var columnLimit3 = new ColumnLimit(3);

        var groupLimit1 = new GroupLimit(1);
        var groupLimit4 = new GroupLimit(4);
        var groupLimit7 = new GroupLimit(7);
        cellLimit.push(cell22)
        cellLimit.push(cell33)
        cellLimit.push(cell25)
        cellLimit.push(cell21)
        cellLimit.push(cell23)
        cellLimit.push(cell27)

        rowLimit1.push(cell21)
        rowLimit2.push(cell22)
        rowLimit3.push(cell23)
        rowLimit3.push(cell33)
        rowLimit5.push(cell25)
        rowLimit5.push(cell27)

        columnLimit2.push(cell22)
        columnLimit2.push(cell21)
        columnLimit2.push(cell23)
        columnLimit2.push(cell25)
        columnLimit2.push(cell27)
        columnLimit3.push(cell33)

        groupLimit1.push(cell22)
        groupLimit1.push(cell21)
        groupLimit1.push(cell23)
        groupLimit1.push(cell33)
        groupLimit4.push(cell25)

        groupLimit7.push(cell27)
        cellLimit.wxyzRemove();
        cell21.values.should.eql([9, 6]);
        cell23.values.should.eql([3, 2])
    })
})
describe('==> base limit ', function() {

    it('规则过滤', function() {
        var limit = new BaseLimit();
        var cell = new Cell(1, 1);
        cell.values = [3, 4];
        var cell2 = new Cell(1, 2);
        cell2.values = [3, 6, 7];
        limit.push(cell);
        limit.push(cell2);
        limit.uniqueAlternate();
        cell.val.should.eql(4);
    })
    it("候选数 删减法", function() {
        var limit = new BaseLimit();
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


})
describe('==>group limit', function() {
        it("blockRemoveAlternate", function() {
            var groupLimit = new GroupLimit();
            var rowLimit = new RowLimit();
            var cell11 = new Cell(1, 1);
            cell11.values = [3, 4];

            var cell21 = new Cell(2, 1);
            cell21.values = [3, 5];

            var cell12 = new Cell(1, 2);
            cell12.values = [8, 4];

            var cell22 = new Cell(2, 2);
            cell22.values = [9, 1];

            groupLimit.push(cell11)
            groupLimit.push(cell21)
            groupLimit.push(cell12)
            groupLimit.push(cell22)

            var cell41 = new Cell(4, 1);
            cell41.values = [3, 9, 8];

            var cell51 = new Cell(5, 1);
            cell51.values = [3, 7, 6];

            rowLimit.push(cell11)
            rowLimit.push(cell21)
            rowLimit.push(cell41)
            rowLimit.push(cell51)
            groupLimit.blockRemoveAlternate();
            cell41.values.should.eql([9, 8])
            cell51.values.should.eql([7, 6])
        })
    })
    //因为limitmanager是单例模式所以不能一起运行
describe('==>公开cal案例', function() {
    it("中等难度1", function() {
        var questions = [
            [1, 0, 5, 7, 0, 6, 0, 2, 0],
            [0, 3, 0, 2, 0, 9, 0, 5, 1],
            [0, 2, 0, 0, 0, 0, 7, 0, 0],
            [0, 0, 3, 0, 0, 8, 5, 0, 0],
            [0, 4, 0, 3, 0, 5, 0, 7, 0],
            [0, 0, 1, 6, 0, 0, 9, 0, 0],
            [0, 0, 8, 0, 0, 0, 0, 1, 0],
            [3, 1, 0, 8, 0, 7, 0, 9, 0],
            [0, 7, 0, 9, 0, 2, 8, 0, 4]
        ]
        LimitManager.loadQuestion(questions)
        LimitManager.resolve();
        LimitManager.print()
    })
    it('中等难度2', function() {
        var questions = [
            [0, 0, 6, 0, 5, 0, 3, 0, 4],
            [0, 0, 0, 0, 4, 0, 9, 0, 1],
            [0, 0, 2, 0, 0, 9, 0, 0, 6],
            [2, 0, 1, 0, 9, 4, 8, 0, 0],
            [0, 0, 0, 8, 0, 2, 0, 0, 0],
            [0, 0, 7, 5, 3, 0, 2, 0, 9],
            [3, 0, 0, 9, 0, 0, 1, 0, 0],
            [5, 0, 9, 0, 8, 0, 0, 0, 0],
            [6, 0, 8, 0, 1, 0, 4, 0, 0]
        ]
        LimitManager.loadQuestion(questions)
        LimitManager.resolve();
        LimitManager.print()
    })
})
