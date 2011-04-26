
module.exports = Store

function merge(array, item){
  if(!array)
    array = []
    if(!~array.indexOf(item))
      array.push(item)
    return array
}

function Store (){
  if(!(this instanceof Store)) return new Store()

  var passes = {}
    , passed = {}
    , modules = {}
    , tests = {}

  this.modules = modules
  this.tests = tests

  function r(){
    return 'MM.' + (this.isTest ? 'Test' : 'Module') +
      '(' +
        [ JSON.stringify(this.name)
        , JSON.stringify(this.depends)
        , this.closure.toString()
        ].join(',')
      + ');'
  }

  this.add = function (n,depends,closure,isTest){
    var m = {
      "name": n
    , depends: depends
    , closure: closure
    , isTest: isTest
    , toString: r
    }
    var o = (isTest ? tests : modules)[n]
    if(o){
      if(m.toString() === o.toString())
        return null
      throw new Error((isTest ? 'test ' : 'module ') + JSON.stringify(n) + ' already exists')
      //would be better to log the modules which already exist and notify the user.
    }
    ;(isTest ? tests : modules)[n] = m

    return m
  }
  this.pass = function (test,module){
    //save module has passed test.
    passes[test] = merge(passes[test],module)
    passed[module] = merge(passed[module],test)
  }
  this.passes = function (list){
    if(arguments.length == 0)
      return passes
    if(Array.isArray(list)){//find modules that pass all tests in list.
      return list
        .map(function (e){
          return passes[e]
        })
        .reduce(function (left,right){
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
  }
  this.passed = function (module){
    return passed[module]
  }
  this.select = function (tests){
    var p = this.passes(tests)
    return modules[p && p[0] ]
    //get module which passes test(s)
  }
  this.depends = function (tests){
    var r = {}
      , self = this
    function x (test){
      if(Array.isArray(test))
        return test.forEach(x)
      if(r[test])
        return
      var m = self.select(test)
      if(!m){
        r[test] = 'undefined'
        return
      }
      r[test] = m.name
      if(m.depends.length)
        m.depends.forEach(x)
    }
    tests.forEach(x)
    return r
  }
}
