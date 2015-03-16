'use strict';

var ResponseHandler = function(){};

ResponseHandler.prototype.withCallback = function(cb) {
  return function(err, res){
    if(err && !res) return cb(err, null);
    if(res.ok){
      return cb(null, res.body);
    } else if (res.error) {
      return cb(res.error, res);
    }
  };
};

module.exports = new ResponseHandler();