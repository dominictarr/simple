

test('THISTEST'
, ['THISTEST',dependency1]
, function (target, dependency2){

  //test which either passes target or not.
  //throw an exception if target is not compatible with this test.
})

module('m1'//module name purely for identification.
, []//no dependencies
, function (){ //loading closure.

  return {} // this object.

})

module('m2'//module name purely for identification.
, ['THISTEST']//depends on THISTEST
, function (m1){ //loading closure, with passes in dependency

  return {m1: m1} // this object.

})


/*
then, 

topological sort tests/modules

then run all single dependency tests against modules without dependencies.

adding passing modules to another map (test: -> module)

then, we can run tests which depend on those test

*/