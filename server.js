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
function createServer (){
  var s = simple()

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
        res.end(JSON.stringify(s.passes()))
        break
    }


  })

}

if(!module.parent){
  createServer ().listen(2020)
}
