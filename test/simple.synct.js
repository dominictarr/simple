
var simple = require('../simple')
  , it = require('it-is')

exports ['simple interface'] = function (){

  var s = simple()
    , r = Math.random()
    , n,c
 
  s.module(n = 'hi',[],c = function (){ return r })
//  s.add('test-hi',[],function (){},true)

  s.pass('test-hi','hi')
  
  it(s.select('test-hi'))
    .has({
      name: n
    , closure: it.strictEqual(c)  
    })
}

/*
  add support for a choose function, 
  which selects the "BEST" pass...
*/