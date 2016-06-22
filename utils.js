function uniqueArray(arr) {
    var seen = [];
    arr.forEach(function(item) {
        if (seen.indexOf(item) == -1) {
            seen.push(item)
        }
    })
    return seen;
}

function differenceArray(arr, compareArray) {
    var seen = [];
    arr.forEach(function(item) {
        if (compareArray.indexOf(item) == -1) {
            seen.push(item)
        }
    })
    return seen;
}

function deepEqual() {
    var argus = Array.prototype.slice.call(arguments);
    var length = argus.length;
    console.log(arguments)
    argus[0] = argus[0].sort(function(x, y) {
        return x - y
    })
    for (var i = 1; i < argus.length; i++) {
        if (argus[0].length != argus[i].length) {
            return false;
        }
        argus[i] = argus[i].sort(function(x, y) {
            return x - y
        })
    }
    // console.log(argus)
    for (var i = 0; i < argus[0].length; i++) {
        for (var j = 1; j < length; j++) {
            console.log(j, argus[j])
            if (argus[0][i] != argus[j][i]) {
                return false;
            }
        }
    }
    return true;

}
function inherit(subtype, supertype) {
    function F() {}
    F.prototype = supertype.prototype;
    var prototype = new F()
    prototype.constructor = supertype;
    subtype.prototype = prototype;
}
module.exports={
	uniqueArray:uniqueArray,
	deepEqual:deepEqual,
	inherit:inherit,
	differenceArray:differenceArray
}
