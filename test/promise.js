var Promise = require('../lib');
var sinon = require('sinon');
var assert = require('assert');
var adapter = require('./adapter');
describe('Promises/A+ Tests', function() {
  require('promises-aplus-tests').mocha(adapter);
});
describe('Promise', function() {
  describe('Promise._immediateFn', function() {
    afterEach(function() {
      Promise._immediateFn =
        (typeof setImmediate === 'function' &&
          function(fn) {
            setImmediate(fn);
          }) ||
        function(fn) {
          setTimeout(fn, 1);
        };
    });
    it('changes immediate fn', function() {
      var spy = sinon.spy();

      function immediateFn(fn) {
        spy();
        fn();
      }
      Promise._immediateFn = immediateFn;
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

      Promise._immediateFn = immediateFn1;
      var done = false;
      new Promise(function(resolve) {
        resolve();
      }).then(function() {});
      Promise._immediateFn = immediateFn2;
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
  describe('Promise._onUnhandledRejection', function() {
    var stub, sandbox;
    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      stub = sandbox.stub(console, 'warn');
    });
    afterEach(function() {
      sandbox.restore();
    });
    it('no error on resolve', function(done) {
      Promise.resolve(true)
        .then(function(result) {
          return result;
        })
        .then(function(result) {
          return result;
        });

      setTimeout(function() {
        assert(!stub.called);
        done();
      }, 50);
    });
    it('error single Promise', function(done) {
      new Promise(function() {
        throw new Error('err');
      });
      setTimeout(function() {
        assert(stub.calledOnce);
        done();
      }, 50);
    });
    it('multi promise error', function(done) {
      new Promise(function() {
        throw new Error('err');
      }).then(function(result) {
        return result;
      });
      setTimeout(function() {
        assert(stub.calledOnce);
        done();
      }, 50);
    });
    it('promise catch no error', function(done) {
      new Promise(function() {
        throw new Error('err');
      }).catch(function(result) {
        return result;
      });
      setTimeout(function() {
        assert(!stub.called);
        done();
      }, 50);
    });
    it('promise catch no error', function(done) {
      new Promise(function() {
        throw new Error('err');
      })
        .then(function(result) {
          return result;
        })
        .catch(function(result) {
          return result;
        });
      setTimeout(function() {
        assert(!stub.called);
        done();
      }, 50);
    });
    it('promise reject error', function(done) {
      Promise.reject('hello');
      setTimeout(function() {
        assert(stub.calledOnce);
        done();
      }, 50);
    });
    it('promise reject error late', function(done) {
      var prom = Promise.reject('hello');
      prom.catch(function() {});
      setTimeout(function() {
        assert(!stub.called);
        done();
      }, 50);
    });
    it('promise reject error late', function(done) {
      Promise.reject('hello');
      setTimeout(function() {
        assert.equal(stub.args[0][1], 'hello');
        done();
      }, 50);
    });
  });
  describe('Promise.prototype.then', function() {
    var spy, SubClass;
    beforeEach(function() {
      spy = sinon.spy();
      SubClass = function() {
        spy();
        Promise.apply(this, arguments);
      };

      function __() {
        this.constructor = SubClass;
      }
      __.prototype = Promise.prototype;
      SubClass.prototype = new __();

      SubClass.prototype.then = function() {
        return Promise.prototype.then.apply(this, arguments);
      };
    });
    it('subclassed Promise resolves to subclass', function() {
      var prom = new SubClass(function(resolve) {
        resolve();
      }).then(function() {}, function() {});
      assert(spy.calledTwice);
      assert(prom instanceof SubClass);
    });
    it('subclassed Promise rejects to subclass', function() {
      var prom = new SubClass(function(_, reject) {
        reject();
      }).then(function() {}, function() {});
      assert(spy.calledTwice);
      assert(prom instanceof SubClass);
    });
  });
  describe('Promise.prototype.finally', function() {
    it('should be called on success', function(done) {
      Promise.resolve(3).finally(function() {
        assert.equal(arguments.length, 0, 'No arguments to onFinally');
        done();
      });
    });

    it('should be called on failure', function(done) {
      Promise.reject(new Error()).finally(function() {
        assert.equal(arguments.length, 0, 'No arguments to onFinally');
        done();
      });
    });

    it('should not affect the result', function(done) {
      Promise.resolve(3)
        .finally(function() {
          return 'dummy';
        })
        .then(function(result) {
          assert.equal(result, 3, 'Result was the resolved result');
          return Promise.reject(new Error('test'));
        })
        .finally(function() {
          return 'dummy';
        })
        .catch(function(reason) {
          assert(!!reason, 'There was a reason');
          assert.equal(reason.message, 'test', 'We catched the correct error');
        })
        .finally(done);
    });

    it('should reject with the handler error if handler throws', function(done) {
      Promise.reject(new Error('test2'))
        .finally(function() {
          throw new Error('test3');
        })
        .catch(function(reason) {
          assert.equal(reason.message, 'test3', 'The handler error was caught');
        })
        .finally(done);
    });

    it('should await any promise returned from the callback', function(done) {
      var log = [];
      Promise.resolve()
        .then(function() {
          log.push(1);
        })
        .finally(function() {
          return Promise.resolve()
            .then(function() {
              log.push(2);
            })
            .then(function() {
              log.push(3);
            });
        })
        .then(function() {
          log(4);
        })
        .then(function() {
          assert.deepEqual(log, [1, 2, 3, 4], 'Correct order of promise chain');
        })
        .finally(done);
    });
  });

  describe('Promise.all', function() {
    it('throws on implicit undefined', function() {
      return Promise.all().then(
        function() {
          assert.fail();
        },
        function(error) {
          assert.ok(error instanceof Error);
        }
      );
    });
    it('throws on explicit undefined', function() {
      return Promise.all(undefined).then(
        function() {
          assert.fail();
        },
        function(error) {
          assert.ok(error instanceof Error);
        }
      );
    });
    it('throws on null', function() {
      return Promise.all(null).then(
        function() {
          assert.fail();
        },
        function(error) {
          assert.ok(error instanceof Error);
        }
      );
    });
    it('throws on 0', function() {
      return Promise.all(0).then(
        function() {
          assert.fail();
        },
        function(error) {
          assert.ok(error instanceof Error);
        }
      );
    });
    it('throws on false', function() {
      return Promise.all(false).then(
        function() {
          assert.fail();
        },
        function(error) {
          assert.ok(error instanceof Error);
        }
      );
    });
    it('throws on a number', function() {
      return Promise.all().then(
        function() {
          assert.fail(20);
        },
        function(error) {
          assert.ok(error instanceof Error);
        }
      );
    });
    it('throws on a boolean', function() {
      return Promise.all(true).then(
        function() {
          assert.fail();
        },
        function(error) {
          assert.ok(error instanceof Error);
        }
      );
    });
    it('throws on an object', function() {
      return Promise.all({ test: 'object' }).then(
        function() {
          assert.fail();
        },
        function(error) {
          assert.ok(error instanceof Error);
        }
      );
    });
  });
});
