
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
    if(err)
      throw err
    it(JSON.parse(body)).deepEqual({
      tests: ['identityTest']
    , modules: ['identity']
    })
    test.done()
  })
}

exports ['check passes'] = function (test){
  request({uri: path('/passes')},function (err,res,body){
    it(JSON.parse(body)).deepEqual({'identityTest':['identity']})
    test.done()
  })
}
