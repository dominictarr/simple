
/*var loadingTimeout

function Module (name,depends,closure){
  store.add(name,depends,closure,false)
}

_pass(test,module){
  if(!loadingTimeout)
    loadingTimeout = setTimeout(load,0)
  store.pass(test,module)
}

function load(){
//  if
}
*/

var fs = require('fs')
  , join = require('path').join
  , store = wrap('store.js')
  , context = wrap('context.js')

function wrap (file){
  return [
      'function (){'
    , 'var exports = {}, module = {exports: exports};'
    , fs.readFileSync(join(__dirname,file))
    , '//new line'
    , ';return module.exports;'
    , '}'].join('\n')
}

var Module = function (name,depends,closure){
  return store.add(name,depends,closure,false)
}
var _pass = function (test,module){
  return store.pass(test,module)
}

var makeResolve = function (){
  var Store = StoreM()
  var Context = ContextM

  return new Store()
}

module.exports = function (){


  return [
    'var MM = (function (){'
  , '  var storeM = ' + store
  , '  var contextM = ' + context
  , '  var store = new (storeM())'
  , '  var context = new (contextM())(store)'
  , '  return {Module: ' + Module.toString()
  , '    , pass: ' + _pass.toString()
  , '    , store: store'
  , '    , context: context'
  , '    , resolve: context.resolve }'
  , '})()'
  ].join('\n')
}
