Module('double',[],function (){
  return function (x){return x+x}
})

Test('test-double',[], function (doub){
  var examples = [1, 123, 0,12,0.5]

  examples.forEach(function (e){
    if(e*2 !== doub(e))
      throw new Error('double did not hold for:' + e)
  })
})

Module('quad',['test-double'], function (doub){
  return function (x){return doub(doub(x))}
})

Test('test-quad',[], function (quad){
  var examples = [1, 123, 0,12,0.5]

  examples.forEach(function (e){
    if(4*e !== quad(e))
      throw new Error('quad did not hold for:' + e)
  })
})
