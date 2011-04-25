/*
post: file, gets evaled and modules are added.
returns JSON of id's of modules.

passes

resolve
*/
var http = require('http')
  , simple = require('./simple')
  , header = require('./header')()

/*
  persist modules in couchdb.

  what is minium I need to expose this to users?

  web page on each module, and show code?

  metrics: lines, characters, dependencies.

  OH YEAH! the important thing, is a browser-friendly resolve.

  include a core .js, and have a generated request,

  have generated request add everything and then trigger the resolve request,
  so that it will still work if all the javascripts are concatenated.

  could send the tests, and run the tests, but could also just send the modules.
*/

module.exports = createServer

    function p(test,module){
      return ('MM.pass(' + JSON.stringify(test) + ',' + JSON.stringify(module) + ');')
    }
    function r(m){
      return 'MM.' + (m.isTest ? 'Test' : 'Module') +
        '(' +
          [ JSON.stringify(m.name)
          , JSON.stringify(m.depends)
          , m.closure.toString()
          ].join(',')
        + ');'
    }

function createServer (){
  var s = simple()

  function resolve(tests){
    var passes = []
      , modules = []
      , deps = s.store.depends(tests)
    for(var tname in deps){
      var mname = deps[tname]
        , module = s.store.modules[mname]
      if(!module)
        modules.push('throw new Error("no module passes:\'' + tname+ '\'")')
      else {
        modules.push(r(module))
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
          var loaded = s.loadCtx(file)
          console.log(loaded)
          s.resolveAll()
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
          case 'mm.js':
            res.end(header)
            break
        }
        break
    }
  }
}

if(!module.parent){
  console.log('meta-modular server running on 2020')
  http.createServer(createServer ()).listen(2020)
}
