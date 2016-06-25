function inherit(subtype, supertype) {
    function F() {}
    F.prototype = supertype.prototype;
    var prototype = new F()
    prototype.constructor = supertype;
    subtype.prototype = prototype;
}
module.exports={
	inherit:inherit
}
