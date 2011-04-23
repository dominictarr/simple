
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
    , modules = {}
    , tests = {}

  this.modules = modules
  this.tests = tests

  this.add = function (n,depends,closure,isTest){
    var m = {
      "name": n
    , depends: depends
    , closure: closure
    , isTest: isTest
    }
    ;(isTest ? tests : modules)[n] = m
  }
  this.pass = function (test,module){
    //save module has passed test.
    passes[test] = merge(passes[test],module)
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

  this.select = function (tests){
    var p = this.passes(tests)
    console.log(tests,p)
    return modules[p && p[0] ]
    //get module which passes test(s)
  }

}
