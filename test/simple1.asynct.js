
var simple = require('../simple')
  , it = require('it-is')

exports ['resolve very simple tests'] = function (test){
  var s = simple()
  s.load(['./examples/identity'],__dirname, function (){

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

    test.done()
  })
}

exports ['resolve very simple tests 2'] = function (test){
  var s = simple()
  s.load(['./examples/identity', './examples/stringify'],__dirname, function (){

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

    test.done()
  })
}

exports ['resolve test with dependency'] = function (test){
  var s = simple()
  s.load(['./examples/double'],__dirname, function (){

    s.resolveAll()

    it(s.passes('test-double')).deepEqual(['double'])
    it(s.passes('test-quad')).deepEqual(['quad'])

    test.done()
  })
}

//*/

exports ['tests with primes'] = function (test){

  var s = simple()
  s.load(['./examples/primes'],__dirname, function (){

    it(s.resolvable('test-sieve')).equal(false)

    it(s.run('test-isPrime','isPrime'))
      .has({'status':'success'})

    it(s.resolvable('test-sieve')).equal(false)

    it(s.run('test-upto','upto'))
      .has({'status':'success'})

    it(s.resolvable('test-sieve')).equal(true)

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
    test.done()
  })
}
//*/

