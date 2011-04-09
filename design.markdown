
1. module format with declared dependencies.
  1.1 must be possible to read dependencies without loading the module.
  1.2 special form for dynamicially loaded dependencies.

2. tight sandboxing.
  2.1 forbid monkeypatching. 
  2.2 all IO must be fully mocked out (automatic mock generators?)
  2.3 forbid fs, http, child_process, etc. process.exit.
  2.4 begin with only sync tests.
  2.4.1 hack setTimeout, setInterval and process.nextTick to catch async errors.
  2.4.2 automaticially generate mocks when submitting the tests?
  
