// values polyfill
exports.values = Object.prototype.values = function(obj) {
    return Object.keys(obj).map(function(k){return obj[k]});
};

