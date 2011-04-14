

var simple = require('../simple')
  , Context = require('../context')
  , it = require('it-is')

exports ['simple resolve'] = function (test){

  var s = simple()
    , r = new Context(s)
    , rand = Math.random()

  s.module('hi', [], function (){
    return rand
  })

  s.pass('test-hi','hi')

  r.resolve(['test-hi'], function (hi){

    it(hi).equal(rand)

    test.done()
  })
}

exports ['double resolve'] = function (test){

  var s = simple()
    , r = new Context(s)
    , rand = [Math.random(),Math.random()]
    , called = 0
  s.module('a', [], function (){
    called ++
    return rand[0]
  })
  s.module('b', [], function (){
    called ++
    return rand[1]
  })

  s.pass('test-a','a')
  s.pass('test-b','b')

  r.resolve(['test-a', 'test-b'], function (a,b){

    it([a,b]).deepEqual(rand)
    it(called).equal(2)

    test.done()
  })
}

exports ['tree resolve'] = function (test){

  var s = simple()
    , r = new Context(s)
    , rand = [Math.random(),Math.random()]
    , called = 0

  s.module('a', [], function (){
    called ++
    return rand[0]
  })
  s.module('b', [], function (){
    called ++
    return rand[1]
  })
  s.module('c', ['test-a','test-b'], function (a,b){
    called ++
    return [a,b]
  })

  s.pass('test-a','a')
  s.pass('test-b','b')
  s.pass('test-c','c')

  r.resolve(['test-c'], function (c){

    it(c).deepEqual(rand)
    it(called).equal(3)
    test.done()
  })
}

exports ['duplicate resolve'] = function (test){
  var s = simple()
    , r = new Context(s)
    , rand = [Math.random(),Math.random()]
    , called = 0

  s.module('a', [], function (){
    called ++
    return [1,2,3]
  })
  s.module('b', [], function (){
    called ++
    return {key:'value'}
  })
  s.module('c', ['test-a','test-b'], function (a,b){
    called ++
    return [a,b]
  })

  s.pass('test-a','a')
  s.pass('test-b','b')
  s.pass('test-c','c')

  r.resolve(['test-c','test-c'], function (c1,c2){


    it(c1).deepEqual([[1,2,3],{key:'value'}])
    it(c1).strictEqual(c2)
    it(called).equal(3)
    test.done()
  })
}

exports ['broken resolve'] = function (test){

  var s = simple()
    , r = new Context(s)

  try{
    r.resolve(['test-unknown'], function (){})

  } catch (e){
    console.log(e.message)
    it(e).property('message',it.matches(/no module which passes/))
    test.done()
  }
}
