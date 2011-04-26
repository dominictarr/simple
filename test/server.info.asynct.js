
var http = require('http')
  , server = http.createServer(require('../server')())
  , request = require ('request')
  , it = require('it-is')
  , port = 2020
  , fs = require('fs')
  , join = require('path').join

function path(p){
  return 'http://localhost:' + port + p
}

exports.__setup = function (test){
  server.listen(port,function (){
    var file = ''+ fs.readFileSync(join(__dirname,'examples/primes.js'))

    request.post({uri: path(''), body: file},function (err,res,body){
      it(err).equal(null)

      it(JSON.parse(body)).has({
        tests: it.ok()
      , modules: it.ok()
      })

      test.done()
    })
  })
}

exports.__teardown = function (test){
  server.close()
}

exports ['get info on a module'] = function (test){

  request.get({uri: path('/info/isPrime')},function (err,res,body){
    it(err).equal(null)
    it(res).property('statusCode',200)

    var obj = JSON.parse(body)

    it(obj).has({
      "name": 'isPrime'
    , closure: it.matches(/function.*/)
    , isTest: false
    , depends: []
    , passes: ['test-isPrime']
    })
    test.done()
  })
}

exports ['get info on a test'] = function (test){

  request.get({uri: path('/info/test-isPrime')},function (err,res,body){
    it(err).equal(null)
    it(res).property('statusCode',200)

    var obj = JSON.parse(body)

    it(obj).has({
      "name": 'test-isPrime'
    , closure: it.matches(/function.*/)
    , isTest: true
    , depends: []
    , passes: ['isPrime']
    })
    test.done()
  })
}

exports ['get all test passes'] = function (test){

  request.get({uri: path('/passes')},function (err,res,body){
    it(err).equal(null)
    it(res).property('statusCode',200)

    var obj = JSON.parse(body)
    it(obj).has({
      'test-isPrime': ['isPrime']
    , 'test-upto': ['upto']
    , 'test-sieve': ['sieve','sieve-broke','sieve2']
    , 'test-sieve2': ['sieve','sieve2']

    })
    test.done()
  })

}
