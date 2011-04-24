var Context = require('./context')
  , Store = require('./store')

  /*
  NEXT: client side resolve...

  request passes of a list of tests, get scource with
    Module(name,[depends], function (){})
    and
    _pass(test,module)
  */

function cleanEval (code){
  var process, require, module,exports, __filename, __dirname, setTimeout,setInterval, console
  return eval (code)
}

module.exports = function (){
/*
  Object.freeze(Object.prototype)
  Object.freeze(Object)
  Object.freeze(Array.prototype)
  Object.freeze(Array)
*/
  var store = new Store()
    , results = []
    , curry = require('curry')
    , ctrl = require('ctrlflow')
    , fs = require('fs')
    , join = require('path').join

  var exports = {
    __modules: store.modules
  , __tests: store.tests
  , test: curry(store.add,[true])
  , module: curry(store.add,[false])
  , pass: store.pass
  , store: store
  , select: store.select
  , load: load
  , loadCtx: loadCtx
  , tree: tree
  , moduleTree: moduleTree
  , run: run
  , resolvable: resolvable
  , resolve: resolve
  , resolveAll: resolveAll
  , passes: store.passes
  , isTest: isTest
  , isModule: isModule
  }

  function loadCtx (src){
    var found = {tests: [], modules: []}
    var Test = function (name,depends,closure){
      found.tests.push(name)
      store.add(name,depends,closure,true)
    }
    var Module = function (name,depends,closure){
      found.modules.push(name)
      store.add(name,depends,closure,false)
    }

    eval('' + src)

    return found
  }

  function load (files,relative,done){
    if('function' === typeof relative){
      done = relative
      relative = null
      }

    files.forEach(function (e){
      var file = relative ? join(relative, e) : e

      loadCtx(fs.readFileSync(file + '.js'))

    })
    done()
  }

  function moduleTree(tests){
    var m
    return [(m = store.select(tests)).name].concat(m.depends.map(moduleTree))
  }

  //things are simplified if I insist that tests get the target as the first argument.
  //test closures are evaled only at the root.

  function tree (deps){
    var t = {}

    deps.forEach(function (test){
      var mDep = {}, m = store.select(test)
      mDep[m.name] = tree(m.depends)
      //could iterate all passes
      //and make tree of all resolutions.
      t[test] = mDep
    })
    return t
  }

/*
next: move running tests into seperate object.
*/

  function resolve (deps,closure){
    return new Context(store).resolve(deps,closure)
  }

  function run (test,module){

    if('string' == typeof test)
      test = store.tests[test]
    if('string' == typeof module)
      module = store.modules[module]

    var context = new Context(store)
      , r = {name: module.name, status: 'unresolved'}

    results[test.name] = results[test.name] || []

    var trial

    try{
      var target = context.resolve(module.depends,module.closure)
      trial =
      context.resolve (test.depends, function (){
          var args = arguments
          return function (){
            //inject target here, convention is that target is always first.
            [].unshift.call(args,target)
            test.closure.apply(null,args)
          }
        })
    } catch (err) {
      r.error = err
      results[test.name].push(r)
      return r
    }

    try{
      trial()
      r.status = 'success'
    } catch (err){
      r.status = 'failure'
      r.failure = err
    }
    if(r.status === 'success'){
      store.pass(test.name,module.name)
    }
    results[test.name].push(r)

    return r
  }

/*
either test has been passed, or it's dependencies are passed, or it has no dependencies
*/

  function resolvable (test){
    if(!!store.passes(test))
      return true

    if(!store.tests[test])
      throw new Error('should be a test:' + test)
    for(var x in store.tests[test].depends){
      if(!store.passes(store.tests[test].depends[x]))
        return false
    }
    return true

  }

  function resolveAll (){
    /*
      I should do a tolopogical sort first.
    */

    for(var i in store.tests)
      (function (test){
        if(!resolvable(test.name))
          return
        for(var j in store.modules)
          run(test,store.modules[j])
      })(store.tests[i])
  }

  function isTest (test){
    if(Array.isArray(test))
      return test.reduce(function (x,y){
        return !!x && !!store.tests[y]
      }, true )
    return !!store.tests[test]
  }

  function isModule (module){
    return !!store.modules[module]
  }

  function depends (module){
    return isTest(module)
      ? __test[module].depends
      : store.modules[module].depends
  }

  return exports
}
