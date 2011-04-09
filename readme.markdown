
## the way forward.

  PLAN:
  
    release minimal publicially pushable system.
      sync only -> improve later
      couch db.
      client side app for running a specific test.

  okay, good.
  
  got:
    declare module's dependencies 
      [test1 test2 [test3a test3b]]
    run all tests against all modules
    
    get the modules which pass test(s)
    
    modules can be serialized
    
  what next?:
  
    support async functions
      node's biggest weakness for this application
      difficult error catching.
        i do have complete control of all modules. 
        could i wrap every function?
        or just nextTick etc.

      feels like a dangerious hack, but it might work.

      forbid:
        io,
        and process.exit 
        and c extensions.
        for now.

    run the tests in a seperate process, that can be restarted if while(true); etc.

    (could also inject something into while, for, etc, to check for infinite loop.

    move towards supporting commonJS -> intermediate file format.

    persist test data
      store path, modified time, hash
      watch for changes, and new .js files?
      run test -> module command

    in an ideal world, i'd just make my own langauge.
    this needs to be baked in. feel like it can NEARLY be done, if I can enforce my constraints.
    
    another problem is global context.
      if one module adds something to global context and another removes it, the first one may break mysteriously.
      if you don't use global context this can't happen, though.

    another messy problem is cleaning up asyc state after running a test. 
    sync is easy. (since node core is small, this should be doable)
      
    the ambiton of this thing maybe isn't so much complete security, 
    but that you can't do something nefarious (or break stuff) by accident.

##types of errors

1. cannot resolve

okay, some basic examples are working.

this feels promising, 
  if I abandon commonJS, 
  insist on declaring dependency Tests
  & pass in dependencies,
  
  then maybe i can make something quite interesting.
  
  declarations could be moved into a behaviour.json and I could wrap require
  
  then it should be compatible with most nodejs stuff.
  
  if modules and test can be serialized 
    (i.e. no undeclared closure references) 
    then i'll be able to store them in DBs and stuff.
  
  need lots of dependency resolving stuff.
  
  must avoid cyclic dependencies.
  
  (test free modules first, then thier dependants)
  
  passes
    test: [passing modules]

  depends:
    module (or test):
      depends: [list]
    module: 

      
  go through and add free modules to depends,
    then run free tests, adding those modules to depends
    go over un tested modules again etc.

  



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