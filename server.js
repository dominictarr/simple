/*
post: file, gets evaled and modules are added.
returns JSON of id's of modules.

passes

resolve
*/

var http = require('http')
  , simple = require('./simple')
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
      return ('_pass(' + JSON.stringify(test) + ',' + JSON.stringify(module) + ');')
    }
    function r(m){
      return (m.isTest ? 'Test' : 'Module') +
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
    //console.log(tests)
//    return '1'
    var passes = []
    var modules = []
    var deps = s.store.depends(tests)
    for(var test in deps){
      var module = deps[test]
      passes.push(p(test,module))
      modules.push(r(s.store.modules[module]))
    }
    return [modules.join('\n'), passes.join('\n')].join('\n')
  }

  return http.createServer(function (req,res){

    res.writeHead(200,{
      'Content-Type': 'application/json'
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
        if('passes' == path){
          console.log(args)
          res.end(JSON.stringify(s.passes()))
        } else if('resolve' == path){
          args = args.map(function (e){
            if(~e.indexOf(','))
              return e.split(',')
            return e
          })
          console.log(args)
          res.end(resolve(args))
        }
        break
    }


  })

}

if(!module.parent){
  createServer ().listen(2020)
}
