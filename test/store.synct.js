
var Store = require('../store')
  , it = require('it-is')

exports ['api'] = function (){
  var store = new Store()
  it(store).has({
    select: it.function ()
  , pass: it.function ()
//  , passes: it.function ()
  , add: it.function ()
  })
}

exports ['add'] = function (){
  var store = new Store()
    /*, e = {
      name: 'a'
    , depends: []
    , closure: function (){}
    , isTest: false
    }*/
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
}
