var simple = require ('./simple')

module.exports = Client

function Client (opts){
  if(!(this instanceof Client)) return new Client(opts)

  var s = simple()

  this.error = function (err){throw err}

  this.load =
    function (files,dir,func){
      s.load(files,dir,function (){
        s.resolveAll()
        setTimeout(func,0)
      })
    }
  this.resolve =
    function (depends,closure){
      setTimeout(function (){
        s.resolve(depends,closure)
      },0)
    }
  this.passes =
    function (cb){
      setTimeout(function (){cb(null,s.passes())},0)
    }
}
