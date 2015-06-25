var assert = require('assert'),
	sinon = require('sinon'),
	Promise = require('../Promise');

describe('Promise', function() {
	describe('Promise._setImmediateFn', function() {
		it('changes immediate fn', function() {
			var spy = jasmine.createSpy('callback').and.callFake(function(fn) {
				fn();
			});
			Promise._setImmediateFn(spy);
			var a = new Promise(function(resolve, reject) {
				resolve();
			}).then(function() {});
			expect(spy).toHaveBeenCalled();
		});
		it('changes immediate fn multiple', function() {
			var spy1 = jasmine.createSpy('callback').and.callFake(function(fn) {
				fn();
			});
			var spy2 = jasmine.createSpy('callback').and.callFake(function(fn) {
				fn();
			});
			Promise._setImmediateFn(spy1);
			var a = new Promise(function(resolve, reject) {
				resolve();
			}).then(function() {});
			Promise._setImmediateFn(spy2);
			var a = new Promise(function(resolve, reject) {
				resolve();
			}).then(function() {});
			expect(spy2).toHaveBeenCalled();
			expect(spy1.calls.count()).toBe(1);
		});
	});
});
