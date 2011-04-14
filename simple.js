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

  function add (name,depends,closure,isTest){
    var m = {
          name: name
        , depends: depends
        , closure: closure
        , isTest: isTest }
      , s = {}
      , r, src
    
    for(var i in m) { s[i] = m[i] }
    s.closure = r = Math.random()
    src = '(' + JSON.stringify(s).split('' + r).join(closure.toString()) + ')'

    m = cleanEval(src)
    
    if(!isTest){
      __modules[name] = m
    } else {
      __tests[name] = m
    }

  }

  function loadCtx (src){
    var Test = exports.test
    var Module = exports.module
    eval('' + src)
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
 
/*  function resolveModule(tests){
    var p = firstPass(tests)
      , m = __modules[p]
    return m.closure.apply(null,m.depends.map(resolveModule))
  }

  function resolve(deps,funx){
    return funx.apply(null,deps.map(resolveModule))
  }*/

  function moduleTree(tests){
    var p
    return [p = firstPass(tests)].concat(depends(p).map(moduleTree))
  }

  //things are simplified if I insist that tests get the target as the first argument.
  //test closures are evaled only at the root.

  function tree (deps){
    var t = {}

    deps.forEach(function (module){
      var mDep = {}, p = firstPass(module)
      mDep[p] = tree(depends(p))
      //could iterate all passes
      //and make tree of all resolutions.
      t[module] = mDep
    })
    return t
  }

/*

next: a cached resolve.

wrap it in a context which gets it's own resolve.

*/

  function resolveM(test){
    var p = firstPass(test)
      , m = __modules[p]
    return resolve(m.depends,m.closure)
  }

  function resolve (deps,closure){
    //find get exports for list, and apply to closure.

    return closure.apply(null,deps.map(resolveM))
  }
  
  function run (test,module){
    if('string' == typeof test)
      test = __tests[test]
    if('string' == typeof module)
      module = __modules[module]

    var r = {name: module.name, status: 'unresolved'}
    results[test.name] = results[test.name] || []

    var trial
      , tdeps = 
          ( test.depends[0] == '*' 
          ? test.depends.slice(1)
          : test.depends ) 
    try{
      var target = resolve(module.depends,module.closure)
      trial = 
      resolve (tdeps, function (){
          var args = arguments
          return function (){
            //inject target here, assuming target is always first.
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
    function cp (x){
      return (
        ('boolean' === typeof x || '*' === x)
        ? true 
        : !! __passes[x]
        )
    }

    if(__passes[test])
      return true
    else {
      if(!__tests[test])
        return false
      for(var x in __tests[test].depends){
        if(!cp(__tests[test].depends[x]))
          return false
      }
      return true
    }
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
    if(Array.isArray(list)){
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
