
var simple = require('../simple')
  , it = require('it-is')

  function identityMM (s){
    s.module('identity',[],function (){
      return function (x){return x}
    })

    s.test('identityTest',['*'], function (identity){
      var examples = [1, 123, null, {}, [], function (){}, true, false]
    
      examples.forEach(function (e){
       if(e !== identity(e))
          throw new Error('identity did not hold for:' + e)
      }) 
    })
  } 

exports ['resolve very simple tests'] = function (){
  var s = simple()

  identityMM(s)  

  console.log(s.__passes)

  //does not have any dependencies except the target, so we can run this.
  it(s.resolvable('identityTest')).equal(true)
  
  s.run('identityTest','identity')

  it(s.isTest('identityTest')).equal(true)
  it(s.isModule('identityTest')).equal(false)
  it(s.isTest('identity')).equal(false)
  it(s.isModule('identity')).equal(true)

  it(s.resolvable('identityTest')).equal(true)
  
  // now, identity should have passes idendityTest

  it(s.__passes['identityTest']).deepEqual(['identity'])

  it(s.passes('identityTest')).deepEqual(['identity'])

}

exports ['resolve very simple tests 2'] = function (){
  var s = simple()

  
  s.module('stringify',[],function (){
    return function (x){return JSON.stringify(x)}
  })

  identityMM(s)

  s.resolveAll()

  it(s.passes('identityTest')).deepEqual(['identity'])

  var resolveChecked = false  

  s.resolve(['identityTest'],function (identity){
    resolveChecked = true
    if(identity(identity) !== identity)
      throw 'resolve failed!'
  })

  it(resolveChecked).ok()

  var resolveChecked = false  

  s.resolve([],function (){
    resolveChecked = true
    if(arguments.length !== 0)
      throw 'this function should have no arguments!'
  })

  it(resolveChecked).ok()
}

  function doubleMM (s){
  s.module('double',[],function (){
    return function (x){return x+x}
  })

  s.test('test-double',['*'], function (doub){
    var examples = [1, 123, 0,12,0.5]
    
    examples.forEach(function (e){
      if(e*2 !== doub(e))
        throw new Error('double did not hold for:' + e)
    })
  })

  s.module('quad',['test-double'], function (doub){

      return function (x){return doub(doub(x))}
  })

  s.test('test-quad',['*'], function (quad){
    var examples = [1, 123, 0,12,0.5]
    
    examples.forEach(function (e){
      if(4*e !== quad(e))
        throw new Error('quad did not hold for:' + e)
    })
  })
  }

exports ['resolve test with dependency'] = function (){
  var s = simple()

  doubleMM(s)

  s.resolveAll()

  it(s.passes('test-double')).deepEqual(['double'])
  it(s.passes('test-quad')).deepEqual(['quad'])

}

//*//*

  function primesMM (s){
  s.module('upto',[],function (){
    return function (x){
      var a = []
      while(a.length < x)
        a.push(a.length + 1)
      return a
    }
  })

  s.test('test-upto', ['*'], function (upto){
      var ten= [1,2,3,4,5,6,7,8,9,10]
      var u = upto(10)
      for(var i in u){
        if(u[i] !== ten[i])
          throw new Error('expected:' + ten[i] + 'but got:' + u[i])
      }

      if(upto(0).length != 0)
        throw new Error('expected upto(0) === []')
        
      if(!Array.isArray(upto(0)))
        throw new Error('expected Array.isArray(upto(0))')

  })
  
  s.module('isPrime',[],function (){
    return function (x){
      if(x === 2)
        return true
      if(x === 1)
        return false
      var n = 1
      while(x % ++n !== 0)
        if(n*n > x)
          return true;
      return false
    }
  })

  s.test('test-isPrime', ['*'], function (isPrime){
      var yes = [2,3,5,7,11,13,17,19,23,29]
      var  no = [1,4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,28]

      yes.forEach(function (e){
        if(!isPrime(e))
          throw new Error("isPrime(" + e + ") should be true")
      })
      no.forEach(function (e){
        if(isPrime(e))
          throw new Error("isPrime(" + e + ") should be false")
      })
  })

  s.module('sieve',['test-upto','test-isPrime'],function (upto,isPrime){
    return function (x){
      return upto(x).filter(isPrime)
    }
  })

  s.module('sieve-broke',['test-isPrime'],function (isPrime){
    return function (x){
      var i = 2, primes = [2]

      while((i++) <= x)
        if(isPrime(i))
          primes.push(i)
      return primes
    }
  })

  s.module('sieve2',['test-isPrime'],function (isPrime){
    return function (x){
      var i = 1, primes = []
      
      while((++ i) <= x)
        if(isPrime(i))
          primes.push(i)
      return primes
    }
  })


  s.test('test-sieve', ['*','test-upto','test-isPrime'], function (sieve,upto,isPrime){
    var sieved = sieve(20)
    upto(20).forEach(function (e){
      if(isPrime(e) && !~sieved.indexOf(e) )
        throw new Error('expected ' + e + ' in primes ' + JSON.stringify(sieved))
      else if(! isPrime(e) && ~sieved.indexOf(e) )
        throw new Error('expected ' + e + ' not in primes ' + JSON.stringify(sieved))
    })
  })

  s.test('test-sieve2', ['*'], function (sieve,upto,isPrime){
    var sieved = sieve(100)
      if(sieved .length != 25)
        throw new Error('number of primes under 100 is 25, got:' + sieved )
  })


  }

exports ['tests with primes'] = function (){

  var s = simple()

  primesMM(s)

  it(s.resolvable('test-sieve')).equal(false)
  
  it(s.run('test-isPrime','isPrime'))
    .has({'status':'success'})

  it(s.resolvable('test-sieve')).equal(false)

  it(s.run('test-upto','upto'))
    .has({'status':'success'})

  it(s.resolvable('test-sieve')).equal(true)

  console.log('*****************')

  s.resolveAll()

  it(s.run('test-sieve','sieve'))
    .has({'status':'success'})
  it(s.run('test-sieve','sieve2'))
    .has({'status':'success'})

  it(s.passes(['test-sieve', 'test-sieve2'])).deepEqual(['sieve','sieve2'])

  s.resolve([['test-sieve', 'test-sieve2']], function (sieve){
    it(arguments).has({0: sieve}).property('length',1)

    var s = sieve(10000)
    if(s.length != 1229)
        throw new Error ('number of primes under 10000 is 1229, got:' + s )
  })

  it(s.isTest('test-sieve')).equal(true)
  it(s.isTest(['test-sieve','test-sieve2'])).equal(true)
  it(s.isModule('sieve2')).equal(true)

  it(s.tree([['test-sieve', 'test-sieve2']]))
    .deepEqual
    ( { 'test-sieve,test-sieve2':
        { 'sieve': 
          { 'test-upto': {'upto':{}}
          , 'test-isPrime': {'isPrime':{}}
          }
        }
      } )

  //the head is the module for the first dep (['test-sieve', 'test-sieve2'])
  //the tail is it's dependencies.
  it(s.moduleTree(['test-sieve', 'test-sieve2']))
    .deepEqual ( ['sieve', ['upto'] , ['isPrime']] )

  console.log(s.passes())
}
//*/
