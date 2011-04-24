
var server = require('../server')()
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

exports ['resolve'] = function (test){

  request({uri: path('/resolve/identityTest')},function (err,res,body){
    //it(JSON.parse(body)).deepEqual({'identityTest':['identity']})
    //i'll need a thing which returns the list of modules and passes you need.

    var moduleCalled, passCalled
    moduleCalled = passCalled = false

    ;(function (src){
      var Module = function (name,deps,fun){
        it(name).equal('identity')
        it(deps).deepEqual([])
        it(fun()(12343245)).equal(12343245)
        moduleCalled = true
      }
      var _pass = function (test,module){
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

