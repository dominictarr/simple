
var simple = require('../simple')
  , it = require('it-is')

exports ['identity'] = function (test){
  var s = simple();
  s.load(['./examples/identity','./examples/test/identity'], __dirname, function loaded(){
  
    it(s.resolvable('identityTest')).equal(true)

    var r = s.run('identityTest','identity')
    if(r.failure)
      throw r.failure
    
    it(s.resolvable('identityTest')).equal(true)

    // now, identity should have passes idendityTest

    it(s.__passes['identityTest']).deepEqual(['identity'])

    it(s.passes('identityTest')).deepEqual(['identity'])

    test.done()

  })

}