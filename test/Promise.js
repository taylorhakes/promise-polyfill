var Promise = require('../Promise');
var sinon = require('sinon');
var assert =  require('assert');
var adapter = require('./adapter');

describe("Promises/A+ Tests", function () {
	require("promises-aplus-tests").mocha(adapter);
});

describe('Promise', function() {
	describe('Promise._setImmediateFn', function() {
		it('changes immediate fn', function() {
			var spy = sinon.spy();
			function immediateFn(fn) {
				spy();
				fn();
			};
			Promise._setImmediateFn(immediateFn);
			var done = false;
			new Promise(function(resolve) {
				resolve();
			}).then(function() {
				done = true;
			});
			assert(spy.calledOnce);
			assert(done);
		});
		it('changes immediate fn multiple', function() {
			var spy1 = sinon.spy();
			function immediateFn1(fn) {
				spy1();
				fn();
			}
			var spy2 = sinon.spy();
			function immediateFn2(fn) {
				spy2();
				fn();
			}
			Promise._setImmediateFn(immediateFn1);
			var done = false;
			new Promise(function(resolve) {
				resolve();
			}).then(function() {});
			Promise._setImmediateFn(immediateFn2);

			new Promise(function(resolve) {
				resolve();
			}).then(function() {
				done = true;
			});
			assert(spy2.called);
			assert(spy1.calledOnce);
			assert(done);
		});
	});
});
