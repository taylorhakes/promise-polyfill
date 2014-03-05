/**
 * Created with JetBrains PhpStorm.
 * User: taylorhakes
 * Date: 3/4/14
 * Time: 11:15 PM
 * To change this template use File | Settings | File Templates.
 */
var Promise = require('../Promise');
module.exports = {
	resolved: Promise.resolve,
	rejected: Promise.rejected,
	deferred: function() {
		var obj = {};
		var prom = new Promise(function(resolve, reject) {
			obj.resolve = resolve;
			obj.reject = reject;
		});
		obj.promise = prom;
		return obj;
	}
}