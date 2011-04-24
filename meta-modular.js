var Nihop = require('nih-op')
  , join = require('path').join
  , fs = require('fs')
  , request = require('request')
  , parser = new Nihop ()
      .option('host','h',1)
      .arg(function (a){
//        console.log(a)
      })

var opts = parser.parse(process.argv.slice(2))

  var upload = opts.args.map(function (e){
    return fs.readFileSync(join(process.env.PWD,e),'utf-8')
  }).join('\n')

  request.post({uri:'http://localhost:2020', body: upload}, function (err,res,body){
    if(err)
      throw err
    console.log(body)
  })

//console.log(upload)



