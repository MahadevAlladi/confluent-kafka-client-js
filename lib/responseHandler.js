'use strict';

var ResponseHandler = function(){};

ResponseHandler.prototype.withCallback = function(cb) {
  return function(err, res){
    if (err){
      return cb(err, null);
    }

    if(res.ok){
      return cb(null, res.body);
    } else {
      console.log(res.body);
      // TODO: Error Handling
      return cb(new Error(res.message), null);
    }
  };
};

module.exports = new ResponseHandler();