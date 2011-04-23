Module('upto',[],function (){
  return function (x){
    var a = []
    while(a.length < x)
      a.push(a.length + 1)
    return a
  }
})

Test('test-upto', [], function (upto){
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

Module('isPrime',[],function (){
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

Test('test-isPrime', [], function (isPrime){
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

Module('sieve',['test-upto','test-isPrime'],function (upto,isPrime){
  return function (x){
    return upto(x).filter(isPrime)
  }
})

Module('sieve-broke',['test-isPrime'],function (isPrime){
  return function (x){
    var i = 2, primes = [2]

    while((i++) <= x)
      if(isPrime(i))
        primes.push(i)
    return primes
  }
})

Module('sieve2',['test-isPrime'],function (isPrime){
  return function (x){
    var i = 1, primes = []

    while((++ i) <= x)
      if(isPrime(i))
        primes.push(i)
    return primes
  }
})


Test('test-sieve', ['test-upto','test-isPrime'], function (sieve,upto,isPrime){
  var sieved = sieve(20)
  upto(20).forEach(function (e){
    if(isPrime(e) && !~sieved.indexOf(e) )
      throw new Error('expected ' + e + ' in primes ' + JSON.stringify(sieved))
    else if(! isPrime(e) && ~sieved.indexOf(e) )
      throw new Error('expected ' + e + ' not in primes ' + JSON.stringify(sieved))
  })
})

Test('test-sieve2', [], function (sieve,upto,isPrime){
  var sieved = sieve(100)
    if(sieved .length != 25)
      throw new Error('number of primes under 100 is 25, got:' + sieved )
})
