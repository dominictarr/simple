module.exports = Context

function Context (store){
  if(!(this instanceof Context)) return new Context(store)

  var self = this
    , cache = {}

  self.resolveModule =
  function resolveModule(test){
    var m = store.select(test)
    if(!m)
      throw new Error("no module which passes: '" + test + "'" )
    if(!cache[m.name])
      cache[m.name] = self.resolve(m.depends,m.closure)
    return cache[m.name]
  }
  self.resolve =
  function resolve (deps,closure){
    //find get exports for list, and apply to closure.
    return closure.apply(null,deps.map(self.resolveModule))
  }
}
