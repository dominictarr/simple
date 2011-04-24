
var Store = require('../store')
  , it = require('it-is')

exports ['api'] = function (){
  var store = new Store()
  it(store).has({
    select: it.function ()
  , pass: it.function ()
  , add: it.function ()
  , depends: it.function ()
  })
}

exports ['add'] = function (){
  var store = new Store()

  store.add('a',[],function (){},false)
  store.pass('test-a','a')

  it(store.select('test-a')).has({
     name: 'a'
    , depends: it.deepEqual([])
    , closure: it.function()
    , isTest: false
  })
}

exports ['add multiple'] = function (){
  var store = new Store()
  store.add('a',[],function (){},false)
  store.add('b',[],function (){},false)
  store.add('c',[],function (){},false)
  store.pass('test-a','a')
  store.pass('test-a','b')
  store.pass('test-b','b')
  store.pass('test-b','c')

  it(store.select('test-a')).property('name','a')
  it(store.select('test-b')).property('name','b')
  it(store.select(['test-a','test-b'])).property('name','b')

  var mods = []
  for(var i in store.modules){
    mods.push(i)
  }
  it(mods).deepEqual(['a','b','c'])
  it(store.tests).deepEqual({})

  it(store.depends(['test-a']))
  .deepEqual({
    'test-a': 'a'
  })
}

exports ['add multiple'] = function (){
  var store = new Store()
  store.add('a',[],function (){},false)
  store.add('b',[],function (){},false)
  store.add('c',[],function (){},false)
  store.pass('test-a','a')
  store.pass('test-a','b')
  store.pass('test-b','b')
  store.pass('test-b','c')

  //retrive the modules and passes needed for a given resolve.
  //the pairs are the _pass(key,value) which needs to be sent
  //and the values are the modules to be sent.
  //optionally, could send the tests, and run them before loading the modules.

  it(store.depends(['test-a','test-b']))
  .deepEqual({
    'test-a': 'a'
  , 'test-b': 'b'
  })
}
