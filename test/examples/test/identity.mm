Test('identityTest', ['*'], function (identity){
    var examples = [1, 123, null, {}, [], function (){}, true, false]
    
    examples.forEach(function (e){
      if(e !== identity(e))
        throw new Error('identity did not hold for:' + e)
    })
})