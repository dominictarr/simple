var http = require('http')
  , simple = require('./simple')
  , header = require('./header')()
  , fs = require('fs')

/*
  persist modules in couchdb.
  //just use an append only file, and a backup.
  //append to the main file, and if that works, copy it to the backup.
  //okay, backing up not yet implemented.

  //need something to check if I already have the module.
    -- are just comparing module.toString()
    -- user must provide a unique name for each module/test version.
  //hash the module.toString ...
  //which brings me to module naming.
  refur to modules by:
    hash
    username/modulename //for username's fork of a module
    modulename //for the original author's module.
  -- i'm defuring this, as too hard for now.

  that means: next is users.
    how much 'user' is necessary? provide your name, email at least.
    ... then can inform people when thier tests have been passed, or thier modules
    are supassed. ...or when thier module has passed a new test.

  or web interface...

  ~~~  how does npm handle users?  ~~~

  it has a hash... what does it do? oh yeah, it's a couchdb user.

  what is minimum I need to expose this to users?

  web page on each module, and show code?
    //show code
    //links to dependencies
    //links to passing modules (for tests)
    //links to passed tests (for modules) (will require a passed map)

    turns out I do not have jade installed, so but i'll implement a json version.

  metrics: lines, characters, dependencies.

  OH YEAH! the important thing: a browser-friendly resolve. --DONE

  include a core .js, and have a generated request, --DONE

  have generated request add everything and then trigger the resolve request,
  so that it will still work if all the javascripts are concatenated.

  --currently, manually add script and then call resolve.
  --could at a resolve to a job list, add a script tag, then try again.

  could send the tests, and run the tests, but could also just send the modules.
*/

module.exports = createServer

function p(test,module){
  return ('MM.pass(' + JSON.stringify(test) + ',' + JSON.stringify(module) + ');')
}

function createServer (path){
  var s = simple()
    , ws
  if(path){
    try{
    s.loadCtx(fs.readFileSync(path))//load files
    s.resolveAll()
    }catch(err){
      console.log(err)
    }
    ws = fs.createWriteStream(path,{flags: 'a',encoding: 'utf-8'})
  }

  function save(loaded) {
    if(!ws)
      return
      console.log(loaded)
      var w = []
      loaded.tests.forEach(function (e){
        w.push(s.store.tests[e].toString())
      })
      loaded.modules.forEach(function (e){
        w.push(s.store.modules[e].toString())
      })
    ws.write(w.join('\n'))
  }

  function resolve(tests){
    var passes = []
      , modules = []
      , deps = s.store.depends(tests)
    for(var tname in deps){
      var mname = deps[tname]
        , module = s.store.modules[mname]
      if(!s.store.tests[tname])
        modules.push('throw new Error("test :\'' + tname+ '\' does not exit")')
      else if(!module)
        modules.push('throw new Error("no module passes:\'' + tname+ '\'")')
      else {
        modules.push(module.toString())
        passes.push(p(tname,mname))
      }
    }
    return [modules.join('\n'), passes.join('\n')].join('\n')
  }

  return function (req,res){
    res.writeHead(200,{
      'Content-Type': 'text/javascript'
    })
    switch(req.method){
      case 'POST':
        var file = ''
        req.on('data',function (d){
          file += d
        })
        req.on('end',function (){
          var loaded
          try{
            loaded= s.loadCtx(file)
          } catch(err){
            for(var key in err)
              err[key] = err[key]//flatten setters
            return res.end(JSON.stringify(err))
          }
          save(loaded)
          s.resolveAll()
          console.log(loaded)
          res.end(JSON.stringify(loaded))
        })
        break
      case 'GET':
        var args = req.url.split('/').slice(1)
          , path = args.shift()
        switch(path){
          case 'passes':
            console.log(args)
            res.end(JSON.stringify(s.passes()))
            break
          case 'resolve':
            args = args.map(function (e){
              if(~e.indexOf(','))
                return e.split(',')
              return e
            })
            console.log(args)
            res.end(resolve(args))
            break
          case 'info'://should this be 2-namespace or 1 name space?
            //1-name space seems simpler, why would i want 2?
            //what if i just had a link to the other type
              //also, the module with that name....
              //or vice versa. and use the same template for each.

            var name = args[0]
            var m = {},_m = s.store.tests[name] ? s.store.tests[name] : s.store.modules[name]
            if(!_m)
              return
            for(var key in _m)
              m[key] = _m[key]
            m.closure = m.closure.toString()
            if(m.isTest)
              m.passes = s.store.passes(name)//maybe just have
            else
              m.passes = s.store.passed(name)
            res.end(JSON.stringify(m))

            break
          case 'mm.js':
            res.end(header)
            break
          default:
            res.writeHead(404,{
              'Content-Type': 'text/javascript'
            })
            res.end('oops!')
        }
        break
    }
  }
}

if(!module.parent){
  console.log('meta-modular server running on 2020')
  http.createServer(createServer (process.env.HOME + '/.meta-modular')).listen(2020)
}
