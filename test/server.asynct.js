
var http = require('http')
  , server = http.createServer(require('../server')())
  , request = require ('request')
  , it = require('it-is')
  , port = 2020
  , fs = require('fs')
  , join = require('path').join

exports.__setup = function (test){
  server.listen(port,test.done)
}
exports.__teardown = function (test){
  server.close()
}

function path(p){
  var r = 'http://localhost:' + port + p
  console.log(r)
  return r
}

exports['call passes on empty database'] = function (test){

  //should return {}

  request({uri: path('/passes')},function (err,res,body){
    if(err)
      throw (err)

    console.log(body)
    it(JSON.parse(body)).deepEqual({})
    test.done()
  })

}

exports['load file'] = function (test){
 var file = ''+ fs.readFileSync(join(__dirname,'examples/identity.js'))
  request.post({uri: path(''), body:file},function (err,res,body){
    it(err).equal(null)

    it(JSON.parse(body)).deepEqual({
      tests: ['identityTest']
    , modules: ['identity']
    })
    test.done()
  })
}



exports ['check passes'] = function (test){
  request({uri: path('/passes')},function (err,res,body){
    it(err).equal(null)
    it(JSON.parse(body)).deepEqual({'identityTest':['identity']})
    test.done()
  })
}


exports ['header'] = function (test){

  request({uri: path('/mm.js')},function (err,res,body){

    eval(body)

    it(MM.Module).function()
    it(MM.pass).function()
    it(MM.resolve).function()

    MM.Module('even', [], function (){
      return function (e){
        return e % 2 == 0
      }
    })

    MM.Module('square', ['test-even'], function (even){
      return function (e){
        even(e)
        return Math.sqrt(e) % 1 == 0
      }
    })

    MM.pass('test-even','even')//by default tests will not be sent to the browser.
    MM.pass('test-square','square')//by default tests will not be sent to the browser.
    // ['test-even','test-square'] can be written as 'test-even/test-square'
    MM.resolve('test-even/test-square', function (even,isSquare){
      it(even(2)).equal(true)
      it(even(7)).equal(false)
      it(isSquare(7)).equal(false)
      it(isSquare(9)).equal(true)

      test.done()
    })

  })
}

exports ['resolve'] = function (test){

  request({uri: path('/resolve/identityTest')},function (err,res,body){
    //it(JSON.parse(body)).deepEqual({'identityTest':['identity']})
    //i'll need a thing which returns the list of modules and passes you need.

    var moduleCalled, passCalled
    moduleCalled = passCalled = false

    ;(function (src){
      var MM = {}
      MM.Module = function (name,deps,fun){
        it(name).equal('identity')
        it(deps).deepEqual([])
        it(fun()(12343245)).equal(12343245)
        moduleCalled = true
      }
      MM.pass = function (test,module){
        it(test).equal('identityTest')
        it(module).equal('identity')
        passCalled = true
      }

      //should be able to eval header, then eval body,
      //then call resolve(['test-pass'],function(pass){...}/)

      //hmm. some parts of this system are simple enough to be loaded
      //via the this system (sync, and inject dependencies)
      //but would need to hard wire a configuration?

      //would need store, & context

      eval(body)

    })(body)

    it(moduleCalled).equal(true)
    it(passCalled).equal(true)

    test.done()
  })
}

exports['load more files'] = function (test){
 var file = ''+ fs.readFileSync(join(__dirname,'examples/primes.js'))

  request.post({uri: path(''), body: file},function (err,res,body){
    it(err).equal(null)

    it(JSON.parse(body)).has({
      tests: it.ok()
    , modules: it.ok()
    })
    test.done()
  })
}

exports ['resolve multiple tests'] = function (test){

  request({uri: path('/resolve/test-sieve,test-sieve2')},function (err,res,body){

    var expect = ['test-isPrime', 'test-upto', 'test-sieve','test-sieve2'].sort()
      , tests = []

    ;(function (src){
      var MM = {}
      MM.Module = function (name,deps,fun){}
      MM.pass = function (test,module){
        tests.push(test)
      }
      eval(src)

    })(body)

    it(tests.sort()).deepEqual(expect)

    test.done()
  })
}
//*/

