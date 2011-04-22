//client.asynct.js

var client = require('../client')
  , it = require('it-is')
/*
just the proportion of the interface which will be transferred over http.

load

resolve

passes
*/

exports ['load'] = function (test){

  var c = client()

  c.load(['./examples/identity'],__dirname, function (err){
    it(err).equal(null)
    c.passes(function (err,tree){
      it(tree).deepEqual({'identityTest': ['identity']})
      //resolve function

      c.resolve(['identityTest'],function (id){
        var i = 0
        while(i < 100){
          var r = Math.random() * i++
          it(id(r)).equal(r)
        }
        test.done()
      })
    })
  })
}
