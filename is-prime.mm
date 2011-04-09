Module([],function (){
      if(x === 2)
        return true
      if(x === 1)
        return false
      var n = 1
      while(x % ++n !== 0)
        if(n*n > x)
          return true;
      return false
}) 