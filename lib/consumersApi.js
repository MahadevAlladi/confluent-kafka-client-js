'use strict';

var _ = require('underscore');
var request = require('superagent');

var ConsumersApi = function(client){
  this.client = client;
};

ConsumersApi.prototype.create = function(groupName, payload, callback) {
  _.defaults(payload, {
    format: 'avro'
  });

  return request
    .post(this.client.urlFor('/consumers/' + groupName))
    .type(this.client.defaultContentType)
    .send(JSON.stringify(payload))
    .end(this.client.responseHandler.withCallback(callback));
};

module.exports = function(client){
  return new ConsumersApi(client);
};