var header = require('../header')
  , it = require('it-is')

exports ['run header'] = function (){

  eval(header())

  it(MM.Module).function()
  it(MM.pass).function()
  it(MM.resolve).function()

}

exports ['run header'] = function (){

  eval(header())

  MM.Module('even', [], function (){
    return function (e){
      return e % 2 == 0
    }
  })

  MM.Module('square', ['test-even'], function (even){
    return function (e){
      even(e)
      return Math.sqrt(e) % 1 == 0
    }
  })

  MM.pass('test-even','even')//by default tests will not be sent to the browser.
  MM.pass('test-square','square')//by default tests will not be sent to the browser.

  MM.resolve(['test-even', 'test-square'], function (even,isSquare){
    it(even(2)).equal(true)
    it(even(7)).equal(false)
    it(isSquare(7)).equal(false)
    it(isSquare(9)).equal(true)
  })
}
