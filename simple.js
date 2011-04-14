var Context = require('./context')

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

  var __modules = {}
    , __tests = {}
    , results = []
    , __passes = {}
    , curry = require('curry')
    , ctrl = require('ctrlflow')
    , fs = require('fs')
    , join = require('path').join

  var exports = {
    __passes: __passes
  , test: curry(add,[true])
  , module: curry(add,[false])
  , pass: pass
  , select: select
  , load: load
  , tree: tree
  , moduleTree: moduleTree
  , run: run
  , resolvable: resolvable
  , resolve: resolve
  , resolveAll: resolveAll
  , closure: closure
  , passes: passes
  , depends: depends
  , isTest: isTest
  , isModule: isModule
  , firstPass: firstPass
  }

  function loadCtx (src){
    var Test = exports.test
    var Module = exports.module
    eval('' + src)
  }
  function add (name,depends,closure,isTest){
    var m = {
          name: name
        , depends: depends
        , closure: closure
        , isTest: isTest }
      , s = {}
      , r, src

    if(depends[0] == '*')
      depends.shift()

    for(var i in m) { s[i] = m[i] }
    s.closure = r = Math.random()
    src = '(' + JSON.stringify(s).split('' + r).join(closure.toString()) + ')'

//    m = cleanEval(src)

    if(!isTest){
      __modules[name] = m
    } else {
      __tests[name] = m
    }

  }

  function pass (test,module){
    if(!__passes[test])
       __passes[test] = []
    if(!~__passes[test].indexOf(module))
      __passes[test].push(module)
  }

  function select(tests){
    return __modules[firstPass(tests)]
  }

  function load (files,relative,done){
    if('function' === typeof relative){
      done = relative
      relative = null
      }

    files.forEach(function (e){
      var file = relative ? join(relative, e) : e

      loadCtx(fs.readFileSync(file + '.mm'))

    })
    done()
  }

  function moduleTree(tests){
    var m
    return [(m = select(tests)).name].concat(m.depends.map(moduleTree))
  }

  //things are simplified if I insist that tests get the target as the first argument.
  //test closures are evaled only at the root.

  function tree (deps){
    var t = {}

    deps.forEach(function (test){
      var mDep = {}, m = select(test)
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
    return new Context(exports).resolve(deps,closure)
  }

  function run (test,module){
    if('string' == typeof test)
      test = __tests[test]
    if('string' == typeof module)
      module = __modules[module]

    var context = new Context(exports)
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
      __passes [test.name] = __passes [test.name] || []

      if(!~__passes [test.name].indexOf(module.name))
        __passes  [test.name].push(module.name)
    }
    results[test.name].push(r)

    return r
  }

  function resolvable (test){

    if(!!passes(x))
      return true

    for(var x in __tests[test].depends){
      if(!passes(__tests[test].depends[x]))
        return false
    }
    return true

  }

  function resolveAll (){
    /*
      improve this to traverse tests more efficantly.

      find free tests and thier modules, then

      this is passing my tests, only because i am defining my modules in topological sort order.

      should I do a tolopogical sort first?
    */

    for(var i in __tests)
      (function (test){
      if(resolvable(test.name))
        for(var j in __modules)
          (function (module){

            var s = Date.now()
            var r = run(test,module)

            if('success' === r.status && -1 == __passes[test.name].indexOf(module.name))
              throw new Error('pass log error at:' + test.name + ' -> ' + module.name)

           })(__modules[j])
        })(__tests[i])
  }

  function isTest (test){
    if(Array.isArray(test))
      return test.reduce(function (x,y){
        return !!x && !!__tests[y]
      }, true )
    return !!__tests[test]
  }

  function isModule (module){
    return !!__modules[module]
  }

  function depends (module){
    return isTest(module)
      ? __test[module].depends
      : __modules[module].depends
  }

  function closure (name){
    return (isModule (name) ? __modules[name] : __tests[name]).closure
  }
  function passes (list){
    if(arguments.length == 0)
      return __passes
    if(Array.isArray(list)){//find modules that pass all tests in list.
      return list.map(exports.passes).reduce(function (left,right){
        var f = []
        right.forEach(function (e){
          if(~left.indexOf(e))
            f.push(e)
        })
        return f
      })
    } else {
      return __passes[list]
    }
  }
  function firstPass (list){
    var p = exports.passes(list)
    return p && p[0]
  }

  return exports
}
