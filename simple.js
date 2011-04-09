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

  var exports = {}
  var modules = []
    , __modules = {}
    , tests = []
    , __tests = {}
    , results = []
    , passes = {}
    , curry = require('curry')
    , ctrl = require('ctrlflow')
    , fs = require('fs')
    , join = require('path').join

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
    
    console.log(m)
    
    if(!isTest){
      __modules[name] = m
    } else {
      __tests[name] = m
    }

  }

  exports.__passes = passes
  exports.test = curry(add,[true])
  exports.module = curry(add,[false])

  function loadCtx (src){

    var Test = exports.test
    var Module = exports.module
    eval('' + src)
  
  }

  var load = 
  exports.load = function (files,relative,done){
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
 

  function get (list, f){
    for (var i in list){
      if(f(list[i]))
        return list[i]
    }
  }

  var resolve = 
  exports.resolve = function (){
    var closure = [].pop.call(arguments)
      , depends = [].shift.call(arguments)
      , star = [].pop.call(arguments)
     //find get exports for list, and apply to closure.

    return closure.apply(null,
      depends.map(function (e){
        if(e === '*')
          return star
        else {
          var _p = exports.passes(e)
            , p = _p && _p[0]
            , m = __modules[p] //getNamed(modules,p)
          if(!p)
            throw new Error('could not find module that passes:\'' + e + "'")
          if(!m)
            throw new Error('could not find module:' + p + '  for test ' + e)
          return resolve(m.depends,m.closure)
        }
      }))
  }

  var getNamed = function (list, name){
    return get(list, function (e){
      return e.name === name
    })
  }
  
  var run = 
  exports .run = function (test,module){
    if('string' == typeof test)
      test = __tests[test]
    if('string' == typeof module)
      module = __modules[module]

    var r = {name: module.name, status: 'unresolved'}
    results[test.name] = results[test.name] || []

    var trial

    try{
      var target = resolve(module.depends,module.closure)
      trial = 
      resolve (test.depends, target, function (){
          var args = arguments
          return function (){
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
//      console.log(err)
      r.status = 'failure'
      r.failure = err
    }

    if(r.status === 'success'){
      passes [test.name] = passes [test.name] || []

      if(!~passes [test.name].indexOf(module.name))
        passes  [test.name].push(module.name)
    }
    results[test.name].push(r)

    return r
  }
  
  var resolvable = 
  exports.resolvable = function (test){
    function cp (x){
      return (
        ('boolean' === typeof x || '*' === x)
        ? true 
        : !! passes[x]
        )
    }

    if(passes[test])
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

  exports.resolveAll = function (){

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
            console.log(r.status === 'success' ? '   P' : '    !', test.name,'->', module.name, 'in:' + (Date.now() - s))

            if('success' === r.status && -1 == passes[test.name].indexOf(module.name))
              throw new Error('pass log error at:' + test.name + ' -> ' + module.name)

           })(__modules[j])
        })(__tests[i])
  }

  exports.passes = function (list){
    if(arguments.length == 0)
      return passes
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
      return passes[list]
    }

    /*var p = []
    if(!results[list])
      throw new Error('have no results for:' + JSON.stringify(list))

    results[list].forEach(function (e){
      if(e.status == 'success')
        p.push(e.name)
    })
  
    return p*/
  }
  
  return exports
}